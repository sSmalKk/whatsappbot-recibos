// commands/turno.js
module.exports = {
    name: "turno",
    execute: async ({ message, client, gameState }) => {
      if (!gameState.isGameRunning) {
        client.sendMessage(message.from, "O jogo ainda não foi iniciado. Use /start para começar.");
        return;
      }
  
      gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
      await client.sendMessage(message.from, `🚀 Turno de: ${gameState.players[gameState.currentTurn]}`);
    },
  };
  