module.exports = {
    processIncomingMessage: (from, message, isGroupMsg, client, whitelist) => {
      const command = message.trim().split(" ")[0].toLowerCase();
      
      // Processa comandos no privado
      if (!isGroupMsg) {
        if (command === "/cadastro") {
          const [_, name] = message.split(" ");
          if (!name) {
            client.sendMessage(from, "Formato inválido. Use: /cadastro <nome>");
            return;
          }
          whitelist.add(from);
          client.sendMessage(from, `Usuário ${name} cadastrado com sucesso.`);
        } else {
          client.sendMessage(from, "Você precisa estar cadastrado para interagir.");
        }
        return;
      }
  
      // Processa comandos no grupo
      switch (command) {
        case "/start":
          client.sendMessage(from, "🎲 RPG iniciado! Preparem-se para a batalha.");
          break;
  
        case "/turno":
          client.sendMessage(from, "🚀 É a sua vez de agir!");
          break;
  
        default:
          client.sendMessage(from, `Comando não reconhecido: ${command}`);
      }
    },
  };
  