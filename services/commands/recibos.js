const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { loadPendingReceipts } = require('../utils/loadReceipts');

// JSON para armazenar o mapeamento dos recibos processados
let recibosMapeados = {};

// Comando para listar recibos pendentes
module.exports = {
  commandName: "recibos",
  execute: async (phoneNumber, client) => {
    try {
      console.log(`Carregando recibos para o número: ${phoneNumber}`);

      // Carrega os recibos pendentes
      const pendingReceipts = await loadPendingReceipts(phoneNumber);

      if (!pendingReceipts || pendingReceipts.receipts.length === 0) {
        client.sendMessage(phoneNumber, "Nenhum recibo pendente ou todos os recibos já foram recebidos.");
        return;
      }

      // Mapeia os recibos carregados para o JSON
      recibosMapeados[phoneNumber] = pendingReceipts.receipts.map((recibo, index) => ({
        id: recibo.id,
        valor: recibo.valor,
        dataEmissao: recibo.dataEmissao,
        index: index + 1,
        row: recibo.row  // Armazena a linha exata do recibo
      }));

      // Prepara a mensagem com a lista de recibos pendentes
      let message = "Recibos pendentes (não recebidos):\n";
      pendingReceipts.receipts.forEach((recibo, index) => {
        message += `${index + 1}. ID: ${recibo.id}, Valor: ${recibo.valor}, Data: ${recibo.dataEmissao}\n`;
      });

      // Envia a lista de recibos pendentes
      client.sendMessage(phoneNumber, message);

    } catch (error) {
      client.sendMessage(phoneNumber, "Erro ao consultar recibos.");
    }
  },

  receivePdf: async (phoneNumber, client, args, chatLocked) => {
    try {
      console.log(`Carregando recibos para o número: ${phoneNumber}`);

      // Carrega os recibos pendentes
      const pendingReceipts = await loadPendingReceipts(phoneNumber);

      if (!pendingReceipts || pendingReceipts.receipts.length === 0) {
        client.sendMessage(phoneNumber, "Nenhum recibo foi carregado. Por favor, execute o comando /recibos primeiro.");
        return;
      }

      const receiptIndex = parseInt(args[0], 10) - 1;

      // Verifica se o índice do recibo é válido
      if (isNaN(receiptIndex) || receiptIndex < 0 || receiptIndex >= pendingReceipts.receipts.length) {
        client.sendMessage(phoneNumber, "Número de recibo inválido. Por favor, tente novamente.");
        return;
      }

      const receipt = pendingReceipts.receipts[receiptIndex];
      console.log(`Recibo selecionado: ID=${receipt.id}, Valor=${receipt.valor}, Data=${receipt.dataEmissao}`);

      // Caminho para salvar o PDF
      const pdfFolderPath = path.join(__dirname, "../../pdf_files", phoneNumber, receipt.dataEmissao.split('-').slice(0, 2).join('-'));
      const pdfPath = path.join(pdfFolderPath, `${receipt.id}.pdf`);

      // Verifica se a pasta existe, se não, cria a pasta
      if (!fs.existsSync(pdfFolderPath)) {
        fs.mkdirSync(pdfFolderPath, { recursive: true });
      }

      // Envia mensagem com detalhes do recibo e aguarda o PDF
      client.sendMessage(phoneNumber, `Você escolheu o Recibo ID: ${receipt.id}, Valor: ${receipt.valor}, Data de Emissão: ${receipt.dataEmissao}. Por favor, envie o PDF.`);

      // Travar o chat
      chatLocked[phoneNumber] = pendingReceipts; // Armazena o recibo e trava o chat

      // Listener para receber o PDF do usuário
      const pdfListener = async (msg) => {
        if (msg.from === phoneNumber && msg.hasMedia) {
          const media = await msg.downloadMedia();

          // Verifica se o arquivo enviado é um PDF
          if (media.mimetype === "application/pdf") {
            fs.writeFileSync(pdfPath, Buffer.from(media.data, "base64"));
            client.sendMessage(phoneNumber, `PDF do recibo ${receipt.id} recebido e salvo.`);

            // Atualiza a célula "Recebido" no Excel usando `receipt.row`
            const filePath = pendingReceipts.filePath;
            const workbook = xlsx.readFile(filePath);
            const worksheet = workbook.Sheets["recibos"];
            const rowToUpdate = receipt.row;  // Usa a linha exata para atualização
            worksheet[`D${rowToUpdate}`] = { v: 1 };  // Marca o recibo como "recebido" no Excel

            // Salva a planilha atualizada
            xlsx.writeFile(workbook, filePath);

            client.sendMessage(phoneNumber, `Recibo ${receipt.id} foi marcado como recebido.`);
            delete chatLocked[phoneNumber];  // Remove o bloqueio após o recebimento do PDF
            client.removeListener('message', pdfListener);  // Remove o listener após salvar o PDF
          } else {
            client.sendMessage(phoneNumber, "Formato de arquivo inválido. Por favor, envie um PDF.");
          }
        }
      };

      // Adiciona o listener para o PDF
      client.on("message", pdfListener);

    } catch (error) {
      client.sendMessage(phoneNumber, "Ocorreu um erro ao processar seu recibo. Por favor, tente novamente.");
      console.error(`Erro ao processar o comando "receberpdf" para ${phoneNumber}:`, error);
    }
  }
};
