// services/WhatsAppService.ts
import { Client, Message, LocalAuth } from 'whatsapp-web.js';
import { EventEmitter } from 'events';
import qrcode from 'qrcode-terminal';

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

  public async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      // Adiciona um log para verificar o estado
      console.log('Estado atual do cliente:', {
        isReady: this.isReady,
        timestamp: new Date().toISOString()
      });

      if (!this.isReady) {
        console.log('Cliente WhatsApp não está pronto. Aguardando...');
        // Opcional: Adicionar uma espera curta e tentar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!this.isReady) {
          console.log('Cliente ainda não está pronto após espera');
          return false;
        }
      }

      // Remove o sufixo @c.us se existir
      const cleanNumber = to.replace('@c.us', '');
      console.log('Tentando enviar mensagem para:', cleanNumber);

      // Adiciona o sufixo @c.us para garantir que é um número privado
      const fullNumber = `${cleanNumber}@c.us`;

      // Envia a mensagem
      await this.client.sendMessage(fullNumber, message);
      console.log('Mensagem enviada com sucesso para:', fullNumber);

      // Cria a mensagem do operador
      const operatorMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        content: message,
        platform: 'whatsapp',
        sender: {
          name: 'Atendente',
          username: 'operator',
          isOperator: true
        },
        timestamp: this.formatDate(new Date())
      };

      // Atualiza o ticket com a mensagem do operador
      let ticket = this.tickets.get(fullNumber);
      if (ticket) {
        ticket.messages.push(operatorMessage);
        ticket.updatedAt = this.formatDate(new Date());
        this.tickets.set(fullNumber, ticket);

        // Emite o evento de atualização do ticket
        this.emit('ticketUpdated', ticket);
        console.log('Mensagem enviada e ticket atualizado');
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