// commands/join.js
module.exports = {
    name: "join",
    execute: async ({ message, client, gameState, whitelist }) => {
      if (!whitelist.has(message.author)) {
        client.sendMessage(message.from, "Você precisa se cadastrar no privado com o comando /cadastro antes de entrar no jogo.");
        return;
      }
  
      if (gameState.players.includes(message.author)) {
        client.sendMessage(message.from, "Você já está participando do jogo.");
        return;
      }
  
      gameState.players.push(message.author);
      await client.sendMessage(message.from, "Você entrou no jogo!");
    },
  };
  