// help.js
module.exports = {
  commandName: "help",
  execute: (phoneNumber, client, args) => {
    const message = `
    Lista de comandos disponíveis:
    /help - Exibe esta mensagem
    /recibos - Exibe recibos pendentes
    `;
    client.sendMessage(phoneNumber, message);
  }
};
