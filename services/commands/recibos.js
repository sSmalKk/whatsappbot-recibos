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
  execute: async (phoneNumber, client, chatLocked) => {
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
      const worksheet = workbook.Sheets["recibos"];

      if (!worksheet) {
        client.sendMessage(phoneNumber, "Nenhuma planilha de recibos encontrada.");
        return;
      }

      // Lista de recibos pendentes (coluna 'Recebido' tem valor 0)
      const userReceipts = [];
      for (let row = 4; worksheet[`A${row}`]; row++) {
        const id = worksheet[xlsx.utils.encode_cell({ c: 0, r: row })]?.v;
        const valor = worksheet[xlsx.utils.encode_cell({ c: 1, r: row })]?.v;
        const dataEmissao = worksheet[xlsx.utils.encode_cell({ c: 2, r: row })]?.v;
        const recebido = worksheet[xlsx.utils.encode_cell({ c: 3, r: row })]?.v;

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

      // Lista os recibos pendentes
      let message = "Recibos pendentes (não recebidos):\n";
      userReceipts.forEach((recibo, index) => {
        message += `${index + 1}. ID: ${recibo.id}, Valor: ${recibo.valor}, Data: ${recibo.dataEmissao}\n`;
      });

      client.sendMessage(phoneNumber, message);

      // Travar o chat e esperar o número do recibo
      chatLocked[phoneNumber] = {
        receipts: userReceipts,
        filePath: filePath
      };

    } catch (error) {
      console.error(`Erro ao consultar recibos para ${phoneNumber}: ${error.message}`);
      client.sendMessage(phoneNumber, "Erro ao consultar recibos.");
    }
  }
};
