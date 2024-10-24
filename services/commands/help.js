// help.js
module.exports = {
  commandName: "help",
  execute: (phoneNumber, client, args) => {
    const message = `
    🤖 *COMANDOS DISPONÍVEIS* 🤖

    📌 *COMO USAR:*
    Para usar qualquer comando, apenas digite o texto que começa com "/" (barra). Não precisa ser complicado, é só copiar e enviar!

    📜 *LISTA DE COMANDOS:*

    - _/help_ 👉 *Mostra esta mensagem.* Se precisar de ajuda, pode usar sempre!
    
    - _/recibos_ 👉 *Lista os recibos pendentes.* Se tem algo para receber, ele vai te mostrar.

    📝 *DICAS IMPORTANTES:*
    1. Escreva o comando corretamente! Não coloque espaços antes ou depois.
    2. Se pedir recibos, você vai receber uma lista. Depois, é só digitar o número que quer e seguir as instruções.
    
    Se tiver dúvidas, só me chamar! 😊
    `;
    client.sendMessage(phoneNumber, message);
  }
};
