const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { loadPendingReceipts } = require('./utils/loadReceipts');

// Função para carregar dinamicamente todos os comandos da pasta 'commands'
const loadCommands = () => {
  const commands = {};
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.commandName && command.execute) {
      commands[command.commandName.toLowerCase()] = command.execute;
    }
  }

  // Adiciona manualmente o comando `receivePdf` para garantir que ele seja carregado
  commands['receberpdf'] = require('./commands/recibos').receivePdf;

  return commands;
};

// Carrega os comandos
const availableCommands = loadCommands();

// Variável para armazenar os estados de chat travado por usuário (para a etapa de número)
let chatLocked = {};

// Função para processar a mensagem recebida
const processIncomingMessage = (phoneNumber, message, client) => {
  const isNumberMessage = /^\d+$/.test(message.trim());

  if (chatLocked[phoneNumber] && isNumberMessage) {
    availableCommands['receberpdf'](phoneNumber, client, [message.trim()], chatLocked);
    return;
  }

  if (message.startsWith('/')) {
    const [command, ...args] = message.slice(1).trim().split(/\s+/);
    const commandLower = command.toLowerCase();

    if (availableCommands[commandLower]) {
      return availableCommands[commandLower](phoneNumber, client, args, chatLocked);
    } else {
      client.sendMessage(phoneNumber, `Comando não reconhecido: ${commandLower}`);
    }
  } else if (isNumberMessage) {
    availableCommands['receberpdf'](phoneNumber, client, [message.trim()], chatLocked);
  } else {
    client.sendMessage(phoneNumber, "Comando não reconhecido. Por favor, tente novamente.");
  }
};

module.exports = { processIncomingMessage };
