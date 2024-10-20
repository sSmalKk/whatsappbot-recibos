# WhatsApp Messaging Service

Este projeto é um serviço de integração com o WhatsApp utilizando a biblioteca `whatsapp-web.js`, permitindo o envio e o processamento de mensagens de maneira automatizada. O sistema utiliza uma lista de permissões (`whitelist`) para garantir que apenas números autorizados possam enviar comandos e interagir com o bot.

## Funcionalidades

- Envio de mensagens automatizadas para números específicos via WhatsApp.
- Processamento de mensagens recebidas de números autorizados.
- Lista de permissões (`whitelist`) configurável via arquivo `.env`.
- Geração de QR code para conectar o cliente WhatsApp.
- Carregamento dinâmico de comandos a partir da pasta de comandos.

## Requisitos

- Node.js v14 ou superior
- WhatsApp instalado em um celular e pronto para sincronização com WhatsApp Web.
- Conta no MongoDB (para conexão com o banco de dados, caso necessário).
- Arquivo `.env` com as variáveis de ambiente configuradas.

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/sSmalKk/whatsappbot.git
   ```

2. `$ npm install`
3. `$ npm start`
