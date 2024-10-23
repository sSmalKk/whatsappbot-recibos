const fs = require('fs');
const path = require('path');
const helpCommand = require("./commands/help"); // Importação manual do comando help

// Função para carregar dinamicamente todos os comandos da pasta 'commands'
const loadCommands = () => {
  const commands = {};
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.commandName && command.execute) {
      commands[command.commandName.toLowerCase()] = command.execute; // Comando convertido para minúsculas
    }
  }

  return commands;
};

// Carrega os comandos, incluindo o help
const availableCommands = {
  [helpCommand.commandName.toLowerCase()]: helpCommand.execute, // Importação manual do comando help
  ...loadCommands(), // Comandos carregados automaticamente
};

const processIncomingMessage = (phoneNumber, message, client) => {
  console.log(`Processando mensagem de ${phoneNumber}: ${message}`);

  // Define o prefixo de comando (pode ser alterado conforme necessário)
  const commandPrefix = "/";

  if (message.startsWith(commandPrefix)) {
    // Extrai o comando e os argumentos da mensagem
    const [command, ...args] = message.slice(commandPrefix.length).trim().split(/\s+/); // Usa regex para tratar múltiplos espaços

    // Converte o comando para minúsculas para evitar problemas de case sensitivity
    const commandLower = command.toLowerCase();

    // Verifica se o comando existe no conjunto de comandos carregados
    if (availableCommands[commandLower]) {
      console.log(`Executando o comando: ${commandLower} para o número: ${phoneNumber}`);
      return availableCommands[commandLower](phoneNumber, client, args); // Executa o comando com os argumentos
    } else {
      console.log(`Comando não encontrado: ${commandLower}`);
      return client.sendMessage(phoneNumber, `Comando não reconhecido: ${commandLower}`);
    }
  }

  // Caso a mensagem não seja um comando reconhecido
  console.log(`Nenhum comando reconhecido para a mensagem: ${message}`);
  return client.sendMessage(phoneNumber, "Comando não reconhecido. Por favor, tente novamente.");
};

module.exports = { processIncomingMessage };
