// help.js
module.exports = {
  commandName: "help",
  execute: (phoneNumber, client) => {
    const helpMessage = `
*Comandos disponíveis:*
1. /cadastro <senha> <nome> <data de nascimento>(exemplo, 01/01/1998) - Registra um novo usuário.
2. /recibos - Lista recibos pendentes.

*Instruções para Envio de Recibos:*
- Após listar os recibos com o comando /recibos, digite o número referente ao recibo desejado para enviar o PDF.
- Exemplo: Se o recibo aparece como "1. ID: 123", digite apenas "1" para selecioná-lo.
- Em seguida, envie o PDF do recibo solicitado.

*Informações Importantes:*
- O app já vem com valores falsos para teste. Você será notificado pelo WhatsApp quando os valores reais forem atualizados.
    `;
    client.sendMessage(phoneNumber, helpMessage);
  },
};
