module.exports = {
  commandName: "help",
  execute: (phoneNumber, client) => {
    const helpText = "Use /menu para ver os comandos disponíveis.";
    client.sendMessage(phoneNumber, helpText);
  }
};
