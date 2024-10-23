const fs = require('fs');
const path = require('path');
const helpCommand = require("./commands/help"); 
const { MessageMedia } = require('whatsapp-web.js');
const xlsx = require('xlsx');

// Função para carregar dinamicamente todos os comandos
const loadCommands = () => {
  const commands = {};
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.commandName && command.execute) {
      commands[command.commandName.toLowerCase()] = command.execute;
    }
  }

  return commands;
};

// Carrega os comandos, incluindo o help
const availableCommands = {
  [helpCommand.commandName.toLowerCase()]: helpCommand.execute,
  ...loadCommands(),
};

// Variável para armazenar os estados de chat travado por usuário
let chatLocked = {};

// Função principal para processar mensagens
const processIncomingMessage = (phoneNumber, message, client) => {
  console.log(`Processando mensagem de ${phoneNumber}: ${message}`);

  // Prefixo de comando
  const commandPrefix = "/";

  // Verifica se o chat está travado aguardando um número de recibo
  if (chatLocked[phoneNumber]) {
    console.log(`Chat travado aguardando um recibo de ${phoneNumber}`);
    
    const receiptIndex = parseInt(message.trim(), 10) - 1;

    // Verifica se o número de recibo é válido
    if (!isNaN(receiptIndex) && chatLocked[phoneNumber].receipts[receiptIndex]) {
      const receipt = chatLocked[phoneNumber].receipts[receiptIndex];
      const pdfFolderPath = path.join(__dirname, "../../pdf_files", phoneNumber, receipt.dataEmissao.split('-').slice(0, 2).join('-'));
      const pdfPath = path.join(pdfFolderPath, `${receipt.id}.pdf`);

      if (!fs.existsSync(pdfFolderPath)) {
        fs.mkdirSync(pdfFolderPath, { recursive: true });
      }

      client.sendMessage(phoneNumber, `Por favor, envie o PDF do recibo ${receipt.id} para completar o processo.`);

      // Listener para receber o PDF
      const pdfListener = async (msg) => {
        if (msg.from === phoneNumber && msg.hasMedia) {
          const media = await msg.downloadMedia();

          if (media.mimetype === "application/pdf") {
            fs.writeFileSync(pdfPath, Buffer.from(media.data, "base64"));
            client.sendMessage(phoneNumber, `PDF do recibo ${receipt.id} recebido e salvo.`);

            // Marca o recibo como recebido
            receipt.recebido = 1;

            // Atualiza a planilha e salva o novo status do recibo
            const filePath = chatLocked[phoneNumber].filePath;
            const workbook = xlsx.readFile(filePath);
            const worksheet = workbook.Sheets["recibos"];
            worksheet[xlsx.utils.encode_cell({ c: 3, r: receiptIndex + 4 })] = { v: 1 };
            xlsx.writeFile(workbook, filePath);

            client.sendMessage(phoneNumber, `Recibo ${receipt.id} foi marcado como recebido.`);
            delete chatLocked[phoneNumber]; // Desbloqueia o chat
            client.removeListener('message', pdfListener);
          } else {
            client.sendMessage(phoneNumber, "Formato de arquivo inválido. Por favor, envie um PDF.");
          }
        }
      };

      client.on("message", pdfListener);
    } else {
      client.sendMessage(phoneNumber, "Número inválido. Por favor, tente novamente.");
    }

    return;
  }

  // Verifica se a mensagem é um comando
  if (message.startsWith(commandPrefix)) {
    const [command, ...args] = message.slice(commandPrefix.length).trim().split(/\s+/);
    const commandLower = command.toLowerCase();

    if (availableCommands[commandLower]) {
      console.log(`Executando o comando: ${commandLower} para o número: ${phoneNumber}`);
      return availableCommands[commandLower](phoneNumber, client, chatLocked, args);
    } else {
      console.log(`Comando não encontrado: ${commandLower}`);
      return client.sendMessage(phoneNumber, `Comando não reconhecido: ${commandLower}`);
    }
  }

  // Caso não seja um comando
  console.log(`Nenhum comando reconhecido para a mensagem: ${message}`);
  return client.sendMessage(phoneNumber, "Comando não reconhecido. Por favor, tente novamente.");
};

module.exports = { processIncomingMessage };
