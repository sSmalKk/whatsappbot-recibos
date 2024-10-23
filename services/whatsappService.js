const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { processIncomingMessage } = require("./processIncomingMessage");
const fs = require("fs");
const path = require("path");

// Lista de usuários permitidos (whitelist)
const whitelist = [
  "351910157296@c.us",  // Enayra Christina Clemente Ferreira
  "351932807734@c.us",  // João Filipe Barbosa Pereira
  "351936338795@c.us",  // Isabelle Cavalcanti
  "351937521835@c.us",  // Jéssica Maria Stephanie Paz
  "351932814716@c.us",  // Leonor Costa Bezerra
  "351933422377@c.us",  // Marcella Faustino Cler
  "351914072466@c.us",  // Lindemberg de Lima Monteiro
  "552185666970@c.us",  // Elamiur Trotti Monteiro
  "351931893606@c.us",  // Lediane de Sousa Tomaz Oliveira
  "351962983914@c.us",  // Natanael Filipe de Sousa Almeida
  "351968207489@c.us",  // Ana Rachel Aguiar Araújo
  "351933989306@c.us",  // Thalison José
  "351933495966@c.us",  // Gabriel
  "556181594849@c.us",  // Gustavo Dantas
];

// Função para verificar se o número está na whitelist
const isWhitelisted = (phoneNumber) => {
  return whitelist.includes(phoneNumber);
};

// Inicializa o cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Escaneie o QR code para conectar ao WhatsApp.");
});

client.on("ready", () => {
  console.log("Cliente WhatsApp pronto.");
});

// Evento para lidar com mensagens recebidas
client.on("message", (message) => {
  const phoneNumber = message.from;
  const userMessage = message.body.trim();

  // Verifica se o número está na whitelist
  if (!isWhitelisted(phoneNumber)) {
    return; // Ignora mensagens de números não autorizados
  }

  // Processa a mensagem
  processIncomingMessage(phoneNumber, userMessage, client);
});

// Inicializa o cliente WhatsApp
client.initialize();
