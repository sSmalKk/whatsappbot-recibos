const helpCommand = require("./commands/help"); // Importação manual do comando help
const fs = require('fs');
const path = require('path');

// Função para carregar dinamicamente todos os comandos da pasta 'commands'
const loadCommands = () => {
  const commands = {};
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.commandName && command.execute) {
      commands[command.commandName] = command.execute;
    }
  }

  return commands;
};

// Carrega os comandos, incluindo o help
const availableCommands = {
  [helpCommand.commandName]: helpCommand.execute, // Importação manual do comando help
  ...loadCommands(), // Comandos carregados automaticamente
};

const processIncomingMessage = (phoneNumber, message, client) => {
  console.log(`Processando mensagem de ${phoneNumber}: ${message}`);

  // Lista de sufixos permitidos
  const commandSuffixes = ["/", ".", "./"];

  // Verifica se a mensagem começa com um sufixo permitido
  for (const suffix of commandSuffixes) {
    if (message.toLowerCase().startsWith(suffix)) {
      const command = message.slice(suffix.length).toLowerCase();

      // Verifica se o comando existe
      if (availableCommands[command]) {
        return availableCommands[command](phoneNumber, client); // Executa o comando
      }
    }
  }

  // Se não houver sufixo ou o comando não for encontrado, não faz nada
  console.log(`Nenhum comando reconhecido e nenhum sufixo detectado em: ${message}`);
};

module.exports = { processIncomingMessage };
