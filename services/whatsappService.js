const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { processIncomingMessage } = require("./processIncomingMessage");
const dotenv = require('dotenv');
dotenv.config();

// Carrega a whitelist a partir do .env e converte em um array
const whitelist = process.env.whitelist ? process.env.whitelist.split(",") : [];

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

client.on("message", (message) => {
  const phoneNumber = message.from;
  const userMessage = message.body.trim();

  if (!isWhitelisted(phoneNumber)) {
    return; // Ignora mensagens de números não autorizados
  }

  processIncomingMessage(phoneNumber, userMessage, client);
});

const sendMessage = async (chatId, message) => {
  try {
    if (!chatId || !message) {
      throw new Error("Chat ID e mensagem são obrigatórios");
    }

    await client.sendMessage(chatId, message);
    console.log(`Mensagem enviada para ${chatId}: ${message}`);

    return {
      success: true,
      message: `Mensagem enviada com sucesso para ${chatId}`,
    };
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${chatId}:`, error);
    return {
      success: false,
      error: `Erro ao enviar mensagem: ${error.message}`,
    };
  }
};

module.exports = {
  sendMessage,
  processIncomingMessage,
};

client.initialize();
