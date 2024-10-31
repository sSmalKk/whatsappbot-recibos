// loadReceipts.js
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

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
    
    // Inicia leitura na linha 5
    for (let row = 5; worksheet[`A${row}`]; row++) {
      const id = worksheet[`A${row}`]?.v;
      const valor = worksheet[`B${row}`]?.v;
      const dataEmissao = worksheet[`C${row}`]?.v;
      const recebido = worksheet[`D${row}`]?.v;

      console.log(`Linha ${row} - ID: ${id}, Valor: ${valor}, Data: ${dataEmissao}, Recebido: ${recebido}`);
      
      // Adiciona recibo ao array apenas se `recebido` for 0 (pendente)
      if (id && parseInt(recebido) === 0) {  
        receipts.push({ id, valor, dataEmissao, recebido });
      }
    }

    console.log(`Recibos pendentes carregados: ${JSON.stringify(receipts, null, 2)}`);
    return { filePath, receipts };

  } catch (error) {
    console.error(`Erro ao carregar recibos para ${phoneNumber}: ${error.message}`);
    return null;
  }
};

module.exports = { loadPendingReceipts };
