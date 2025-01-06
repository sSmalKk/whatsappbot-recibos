// commands/start.js
module.exports = {
    name: "start",
    execute: async ({ message, client, gameState }) => {
      if (gameState.players.length === 0) {
        client.sendMessage(message.from, "Nenhum jogador cadastrado no grupo.");
        return;
      }
  
      gameState.isGameRunning = true;
      gameState.currentTurn = 0;
  
      await client.sendMessage(message.from, `🎲 RPG iniciado! Primeiro turno: ${gameState.players[gameState.currentTurn]}`);
    },
  };
  