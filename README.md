# Sistema Multiplataforma de Atendimento ao Cliente
## Visão Geral

O sistema é uma solução centralizada para gerenciamento de atendimento ao cliente que integra múltiplos canais de comunicação em uma única plataforma. O objetivo é unificar o atendimento e melhorar a experiência tanto dos clientes quanto dos atendentes.

<img src="https://i.imgur.com/SpfXR0k.png" alt="Menu principal" width="1300"/>

## Funcionalidades Principais

### 1. Integração Multicanal
- Instagram
- Twitter
- Facebook
- Site (Fale Conosco)
- Expansível para novos canais

### 2. Gestão de Tickets
- Criação automática de tickets
- Rastreamento de origem
- Sistema de priorização
- Histórico completo de interações

### 3. Interface de Atendimento
- Visão unificada de todos os canais
- Sistema de resposta integrado
- Painéis de performance
- Gestão de filas de atendimento

## Arquitetura do Sistema

### Fluxo de Funcionamento
<img src="https://i.imgur.com/jA52OEM.png" alt="Texto alternativo" width="500"/>

1. Cliente envia mensagem por qualquer canal integrado
2. Sistema captura a mensagem
3. Ticket é criado automaticamente
4. Atendente recebe notificação
5. Interação é realizada dentro da plataforma
6. Resposta é enviada pelo mesmo canal de origem

## Especificações Técnicas

### Backend
- API RESTful
- Sistema de filas para processamento assíncrono
- Banco de dados relacional para tickets e histórico
- Sistema de cache para otimização

### Frontend
- Interface web responsiva
- Dashboard em tempo real
- Sistema de notificações
- Área administrativa

### Integrações
- APIs oficiais das redes sociais
- Webhooks para atualizações em tempo real
- Sistema próprio de Fale Conosco

## Dependências
- Node 22

A instalação das dependências se dá de modo facíl caso tenha `nix` instalado, bastando rodar o seguinte script:
```bash
nix-shell
make build
```