const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

// Função para criar o arquivo XLSX para um usuário específico
function createUserXLSX(filePath, user) {
  const workbook = xlsx.utils.book_new();

  // Criando o conteúdo da planilha para o usuário
  const worksheetData = [
    ["Nome", user.name], // Nome do usuário na primeira linha
    ["Telefone", user.phoneNumber], // Telefone na segunda linha
    [], // Linha vazia
    ["Recibo ID", "Valor", "Data de Emissão", "Recebido"], // Títulos das colunas
    ["1", "100.00", "2024-01-01", "1"], // Exemplo de dados de recibos
    ["2", "150.00", "2024-02-01", "0"]
  ];

  // Converte os dados para a planilha
  const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);

  // Adiciona a planilha ao arquivo XLSX
  xlsx.utils.book_append_sheet(workbook, worksheet, "recibos");

  // Salva o arquivo XLSX no caminho especificado
  xlsx.writeFile(workbook, filePath);
  console.log(`Arquivo criado para o usuário ${user.name} em ${filePath}`);
}

module.exports = { createUserXLSX };
