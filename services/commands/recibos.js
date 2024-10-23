const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const { MessageMedia } = require("whatsapp-web.js");

const jsonFilePath = path.join(__dirname, "../../excel_files", "users.json");

// Função para carregar o JSON com os usuários
function loadJSON() {
  if (fs.existsSync(jsonFilePath)) {
    const jsonData = fs.readFileSync(jsonFilePath);
    return JSON.parse(jsonData);
  } else {
    return { users: [] };
  }
}

module.exports = {
  commandName: "recibos",
  execute: async (phoneNumber, client) => {
    try {
      // Caminho do arquivo de recibos específico para o usuário
      const filePath = path.join(__dirname, `../../excel_files/${phoneNumber}_recibos.xlsx`);

      if (!fs.existsSync(filePath)) {
        client.sendMessage(phoneNumber, "Nenhum arquivo de recibos encontrado para o seu número.");
        return;
      }

      // Carrega os dados do arquivo JSON
      const jsonData = loadJSON();
      const user = jsonData.users.find(u => u.phoneNumber === phoneNumber);
      if (!user) {
        client.sendMessage(phoneNumber, "Nenhum recibo encontrado para o seu número.");
        return;
      }

      // Carrega a planilha de recibos do usuário
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets["recibos"]; // Nome fixo "recibos" para cada planilha de usuário

      if (!worksheet) {
        client.sendMessage(phoneNumber, "Nenhuma planilha de recibos encontrada.");
        return;
      }

      // Lista de recibos pendentes (coluna 'Recebido' tem valor 0)
      const userReceipts = [];
      for (let row = 4; worksheet[`A${row}`]; row++) { // Começa a ler a partir da linha 5
        const id = worksheet[xlsx.utils.encode_cell({ c: 0, r: row })]?.v;
        const valor = worksheet[xlsx.utils.encode_cell({ c: 1, r: row })]?.v;
        const dataEmissao = worksheet[xlsx.utils.encode_cell({ c: 2, r: row })]?.v;
        const recebido = worksheet[xlsx.utils.encode_cell({ c: 3, r: row })]?.v;

        // Apenas adiciona à lista se o recibo ainda não foi recebido (recebido = 0)
        if (id && recebido === 0) {
          userReceipts.push({
            id,
            valor,
            dataEmissao,
            recebido
          });
        }
      }

      if (userReceipts.length === 0) {
        client.sendMessage(phoneNumber, "Nenhum recibo pendente ou todos os recibos já foram recebidos.");
        return;
      }

      // Lista os recibos pendentes (com valor '0' na coluna "Recebido")
      let message = "Recibos pendentes (não recebidos):\n";
      userReceipts.forEach((recibo, index) => {
        message += `${index + 1}. ID: ${recibo.id}, Valor: ${recibo.valor}, Data: ${recibo.dataEmissao}\n`;
      });

      client.sendMessage(phoneNumber, message);

      // Listener para o usuário solicitar um recibo específico
      const messageListener = async (msg) => {
        if (msg.from === phoneNumber) {
          const receiptIndex = parseInt(msg.body.trim(), 10) - 1;

          if (userReceipts[receiptIndex]) {
            const receipt = userReceipts[receiptIndex];
            const pdfFolderPath = path.join(__dirname, "../../pdf_files", phoneNumber, receipt.dataEmissao);
            const pdfPath = path.join(pdfFolderPath, `${receipt.id}.pdf`);

            if (fs.existsSync(pdfPath)) {
              const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");
              client.sendMessage(phoneNumber, new MessageMedia("application/pdf", pdfBase64, `${receipt.id}.pdf`));

              // Marca o recibo como recebido
              receipt.recebido = 1;

              // Atualiza a planilha e salva o novo status do recibo
              userReceipts[receiptIndex].recebido = 1; // Marca como recebido no JSON
              worksheet[xlsx.utils.encode_cell({ c: 3, r: receiptIndex + 4 })] = { v: 1 }; // Atualiza o Excel
              xlsx.writeFile(workbook, filePath);

              client.sendMessage(phoneNumber, `Recibo ${receipt.id} enviado e marcado como recebido.`);
            } else {
              client.sendMessage(phoneNumber, `PDF do recibo ${receipt.id} não encontrado.`);
            }
          } else {
            client.sendMessage(phoneNumber, `Recibo não encontrado ou índice inválido.`);
          }

          client.removeListener("message", messageListener);
        }
      };

      client.on("message", messageListener);

    } catch (error) {
      console.error(`Erro ao consultar recibos para ${phoneNumber}: ${error.message}`);
      client.sendMessage(phoneNumber, "Erro ao consultar recibos.");
    }
  }
};
