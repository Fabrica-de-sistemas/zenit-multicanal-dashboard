// services/WhatsAppService.ts
import { Client, Message, LocalAuth } from 'whatsapp-web.js';
import { EventEmitter } from 'events';
import qrcode from 'qrcode-terminal';
import { chatQueries } from '../database/queries/chatQueries';
import { execute, query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface WhatsAppMessage {
  id: string;
  content: string;
  platform: 'whatsapp';
  sender: {
    name: string;
    username: string;
    isOperator?: boolean;
  };
  timestamp: string;
}

interface Ticket {
  id: string;
  status: 'open' | 'resolved';
  messages: WhatsAppMessage[];
  createdAt: string;
  updatedAt: string;
}

class WhatsAppService extends EventEmitter {
  private static instance: WhatsAppService;
  private client: Client;
  private isReady: boolean = false;
  private tickets: Map<string, Ticket> = new Map();

  private constructor() {
    super();
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ['--no-sandbox'],
      }
    });

    this.initializeClient();
  }

  public addMessageToTicket(ticketId: string, message: any): Ticket | null {

    const ticket = this.tickets.get(ticketId);

    if (ticket) {

      ticket.messages.push(message);

      this.tickets.set(ticketId, ticket);

      return ticket;

    }

    return null;

  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private formatDate(date: Date): string {
    try {
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', date);
        return '';
      }

      return date.toISOString(); // Retorna no formato ISO para garantir consistência
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  }

  private async initializeClient() {
    // Gera o QR Code para autenticação
    this.client.on('qr', (qr) => {
      console.log('QR Code recebido, escaneie para autenticar:');
      qrcode.generate(qr, { small: true });
    });

    // Evento quando o cliente está pronto
    this.client.on('ready', () => {
      this.isReady = true;
      console.log('Cliente WhatsApp está pronto e conectado!');
    });

    // Eventos de controle de conexão
    this.client.on('auth_failure', msg => {
      this.isReady = false;
      console.error('Falha na autenticação:', msg);
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      console.log('Cliente desconectado:', reason);
    });

    this.client.on('message', async (msg: Message) => {
      try {
        // Primeiro, obtém o chat
        const chat = await msg.getChat();

        // Log para debug
        console.log('Nova mensagem recebida:', {
          isGroup: chat.isGroup,
          from: msg.from,
          body: msg.body
        });

        // Verifica se é mensagem de grupo e ignora
        if (chat.isGroup) {
          console.log('Mensagem ignorada: é de um grupo');
          return;
        }

        // Verifica se é mensagem de broadcast e ignora
        if (msg.broadcast) {
          console.log('Mensagem ignorada: é uma broadcast');
          return;
        }

        // Verifica se é uma mensagem de status e ignora
        if (msg.isStatus) {
          console.log('Mensagem ignorada: é uma atualização de status');
          return;
        }

        // Verifica se o número está no formato correto (apenas privado)
        if (!msg.from.endsWith('@c.us')) {
          console.log('Mensagem ignorada: não é uma mensagem privada');
          return;
        }

        const contact = await msg.getContact();
        const ticketId = msg.from;

        console.log('Processando mensagem privada:', {
          from: msg.from,
          contactName: contact.pushname,
          body: msg.body
        });

        const formattedMessage: WhatsAppMessage = {
          id: msg.id.id,
          content: msg.body,
          platform: 'whatsapp',
          sender: {
            name: contact.pushname || contact.name || 'Sem Nome',
            username: msg.from.replace('@c.us', ''),
            isOperator: false
          },
          timestamp: this.formatDate(new Date(msg.timestamp * 1000))
        };

        // Verifica se já existe um ticket para este número
        let ticket = this.tickets.get(ticketId);

        // Se não existe ticket ou o ticket existente está resolvido, cria um novo
        if (!ticket || ticket.status === 'resolved') {
          ticket = {
            id: ticketId,
            status: 'open',
            messages: [formattedMessage],
            createdAt: this.formatDate(new Date()),
            updatedAt: this.formatDate(new Date())
          };
          console.log('Novo ticket criado:', ticketId);
        } else {
          // Adiciona a mensagem ao ticket existente
          ticket.messages.push(formattedMessage);
          ticket.updatedAt = this.formatDate(new Date());
          console.log('Mensagem adicionada ao ticket existente:', ticketId);
        }

        // Atualiza o ticket no Map
        this.tickets.set(ticketId, ticket);

        // Emite o evento com o ticket atualizado
        this.emit('ticketUpdated', ticket);
        console.log('Evento ticketUpdated emitido para:', ticketId);

      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });

    // Inicia o cliente
    try {
      console.log('Iniciando cliente WhatsApp...');
      await this.client.initialize();
      console.log('Cliente WhatsApp inicializado com sucesso');
    } catch (error) {
      this.isReady = false;
      console.error('Erro ao inicializar cliente WhatsApp:', error);
    }
  }

  private async processIncomingMessage(msg: Message) {
    try {
      const chat = await msg.getChat();
      if (chat.isGroup || msg.broadcast || msg.isStatus) return;

      const contact = await msg.getContact();
      const ticketId = msg.from;

      // Salva ou atualiza o ticket
      await execute(chatQueries.createTicket, [ticketId, 'open'])
        .catch(() => { }); // Ignora erro se ticket já existe

      // Salva a mensagem
      const messageId = uuidv4();
      await execute(chatQueries.saveTicketMessage, [
        messageId,
        ticketId,
        msg.body,
        contact.pushname || 'Sem Nome',
        msg.from.replace('@c.us', ''),
        false // não é operador
      ]);

      // Carrega o ticket atualizado
      const ticket = await this.getTicketWithMessages(ticketId);
      if (ticket) {
        this.emit('ticketUpdated', ticket);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  // Método auxiliar para buscar ticket com mensagens
private async getTicketWithMessages(ticketId: string) {
  try {
    const [ticketData] = await query(
      'SELECT * FROM tickets WHERE id = ?',
      [ticketId]
    );

    if (!ticketData) return null;

    const messages = await query(
      'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC',
      [ticketId]
    );

    return {
      id: ticketData.id,
      status: ticketData.status,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: {
          name: msg.sender_name,
          username: msg.sender_username,
          isOperator: msg.is_operator === 1
        },
        timestamp: msg.created_at,
        platform: 'whatsapp'
      })),
      createdAt: ticketData.created_at,
      updatedAt: ticketData.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return null;
  }
}

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.isReady) return false;
  
      const cleanNumber = to.replace('@c.us', '');
      const fullNumber = `${cleanNumber}@c.us`;
  
      // Primeiro, verifica se o ticket existe
      const [existingTicket] = await query(
        'SELECT * FROM tickets WHERE id = ?',
        [fullNumber]
      );
  
      // Se o ticket não existir, cria um novo
      if (!existingTicket) {
        await execute(
          'INSERT INTO tickets (id, status) VALUES (?, ?)',
          [fullNumber, 'open']
        );
      }
  
      // Envia a mensagem via WhatsApp
      await this.client.sendMessage(fullNumber, message);
  
      // Agora que garantimos que o ticket existe, salvamos a mensagem
      const messageId = uuidv4();
      await execute(
        `
        INSERT INTO ticket_messages 
        (id, ticket_id, content, sender_name, sender_username, is_operator)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          messageId,
          fullNumber,
          message,
          'Atendente',
          'operator',
          true
        ]
      );
  
      // Atualiza o timestamp do ticket
      await execute(
        'UPDATE tickets SET updated_at = NOW() WHERE id = ?',
        [fullNumber]
      );
  
      // Busca o ticket atualizado para emitir o evento
      const ticket = await this.getTicketWithMessages(fullNumber);
      if (ticket) {
        this.emit('ticketUpdated', ticket);
      }
  
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  public resolveTicket(ticketId: string): boolean {
    try {
      const ticket = this.tickets.get(ticketId);
      if (ticket) {
        ticket.status = 'resolved';
        ticket.updatedAt = this.formatDate(new Date());
        this.tickets.set(ticketId, ticket);
        this.emit('ticketUpdated', ticket);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao resolver ticket:', error);
      return false;
    }
  }

  public getAllTickets(): Ticket[] {
    return Array.from(this.tickets.values());
  }

  public isClientReady(): boolean {
    return this.isReady;
  }
}

export default WhatsAppService;