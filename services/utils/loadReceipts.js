const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Função para carregar recibos pendentes
const loadPendingReceipts = async (phoneNumber) => {
  try {
    const filePath = path.join(__dirname, `../../excel_files/${phoneNumber}_recibos.xlsx`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`Nenhum arquivo de recibos encontrado para o número: ${phoneNumber}`);
      return null;
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets["recibos"];

    if (!worksheet) {
      console.log(`Nenhuma planilha de recibos encontrada para o número: ${phoneNumber}`);
      return null;
    }

    const receipts = [];
    for (let row = 5; worksheet[`A${row}`]; row++) {
      const id = worksheet[`A${row}`]?.v;
      const valor = worksheet[`B${row}`]?.v;
      const dataEmissao = worksheet[`C${row}`]?.v;
      const recebido = worksheet[`D${row}`]?.v;

      if (id && recebido === 0) {  // Recibo pendente
        receipts.push({ id, valor, dataEmissao, recebido });
      }
    }

    return { filePath, receipts };
  } catch (error) {
    console.error(`Erro ao carregar recibos para ${phoneNumber}: ${error.message}`);
    return null;
  }
};

module.exports = { loadPendingReceipts };
