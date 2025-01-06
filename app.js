const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const client = new Client({ authStrategy: new LocalAuth() });
const RPG_GROUP_ID = process.env.GROUP_ID || null;
const whitelist = new Set();

// Estado global do jogo
const gameState = {
  isGameRunning: false,
  currentTurn: 0,
  players: [],
};

// Carrega comandos dinamicamente
const loadCommands = () => {
  const commands = {};
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.name && command.execute) {
      commands[command.name.toLowerCase()] = command;
    }
  }
  return commands;
};

const commands = loadCommands();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Escaneie o QR code para conectar ao WhatsApp.");
});

client.on("ready", () => {
  console.log("Cliente WhatsApp pronto.");
});

client.on("message", async (message) => {
  const { from, body, isGroupMsg, chat } = message;
  const command = body.trim().split(" ")[0].toLowerCase();
  console.log("teste1")

  if (isGroupMsg) {
    console.log("teste")
    if (!RPG_GROUP_ID) {
      console.log(`DEBUG: Mensagem recebida no grupo:
        - Nome do grupo: ${chat.name}s
        - ID do grupo: ${chat.id._serialized}
        - Autor da mensagem: ${message.author || "Desconhecido"}
        - Conteúdo: ${body}
      `);
      return;
    }

    // Ignora mensagens fora do grupo configurado
    if (chat.id._serialized !== RPG_GROUP_ID) return;

    // Apaga mensagens fora do turno
    if (gameState.isGameRunning && from !== gameState.players[gameState.currentTurn]) {
      await message.delete(true);
      return;
    }

    // Executa comandos de grupo
    if (command.startsWith("/")) {
      const cmd = commands[command.slice(1)];
      if (cmd) {
        await cmd.execute({ message, client, gameState, whitelist });
      } else {
        client.sendMessage(from, `Comando não reconhecido: ${command}`);
      }
    }
  } else {
    // Comandos no privado para cadastro
    if (command === "/cadastro") {
      const name = body.split(" ")[1];
      if (!name) {
        client.sendMessage(from, "Formato inválido. Use: /cadastro <nome>");
        return;
      }
      whitelist.add(from);
      client.sendMessage(from, `Usuário ${name} cadastrado com sucesso.`);
    }
  }
});

client.initialize();
