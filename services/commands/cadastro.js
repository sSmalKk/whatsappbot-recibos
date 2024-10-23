const path = require("path");
const fs = require("fs");
const dotenv = require('dotenv');
const { createUserXLSX } = require('../../routes/services/xlsxImporter');

// Load environment variables
dotenv.config();

// Caminho para o arquivo JSON que guarda informações dos usuários
const jsonFilePath = path.join(__dirname, "../../excel_files", "users.json");

// Função para carregar o JSON
function loadJSON() {
  if (fs.existsSync(jsonFilePath)) {
    const jsonData = fs.readFileSync(jsonFilePath);
    return JSON.parse(jsonData);
  } else {
    return { users: [] };
  }
}

// Função para salvar o JSON
function saveJSON(data) {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
}

// Função para registrar o usuário e criar o arquivo separado
function registerUser(phoneNumber, name) {
  const jsonData = loadJSON();

  // Verifica se o usuário já existe
  const existingUser = jsonData.users.find(user => user.phoneNumber === phoneNumber);
  if (existingUser) {
    console.log(`Usuário ${name} já está registrado.`);
    return;
  }

  // Adiciona o novo usuário ao JSON
  jsonData.users.push({
    name,
    phoneNumber
  });
  saveJSON(jsonData);

  // Caminho do arquivo XLSX individual para o usuário
  const filePath = path.join(__dirname, `../../excel_files/${phoneNumber}_recibos.xlsx`);

  // Cria o arquivo XLSX para o novo usuário
  createUserXLSX(filePath, { name, phoneNumber });
  console.log(`Usuário ${name} registrado e arquivo criado em ${filePath}`);
}

// Definição do comando "cadastro"
module.exports = {
  commandName: "cadastro",
  execute: (phoneNumber, client, args) => {
    const senha = args[0]; // O primeiro argumento é a senha fornecida pelo usuário
    const name = args[1];  // O segundo argumento é o nome do usuário

    // Verifica se a senha está correta
    if (senha === process.env.CORRECT_PASSWORD) {
      registerUser(phoneNumber, name); // Adiciona o usuário
      client.sendMessage(phoneNumber, `Cadastro de ${name} realizado com sucesso! Arquivo de recibos criado.`);
    } else {
      client.sendMessage(phoneNumber, "Senha incorreta. Tente novamente.");
    }
  }
};
