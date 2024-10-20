// routes/services/googleScriptRoutes.js
const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// Middleware para verificar a senha
function checkPassword(req, res, next) {
  const { password } = req.body;
  if (password === process.env.GOOGLE_SCRIPT_PASSWORD) {
    next(); // Senha correta, pode prosseguir
  } else {
    return res.status(403).json({ message: "Senha inválida" });
  }
}

// Função para organizar e criar o JSON da tabela
function createJsonTable(data) {
  const tableJson = data.map((row) => {
    return {
      telefone: row.telefone,
      fatura: row.fatura,
      dataEmissao: row.dataEmissao,
      recebido: row.recebido || false,
    };
  });

  return tableJson;
}

// Rota que será chamada pelo Google Script
router.post("/receiveTable", checkPassword, (req, res) => {
  try {
    const { tableData } = req.body;

    if (!tableData || !Array.isArray(tableData)) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    // Organiza os dados e gera o JSON formatado
    const jsonTable = createJsonTable(tableData);

    return res.status(200).json({ message: "Tabela processada com sucesso", jsonTable });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao processar tabela", error: error.message });
  }
});

module.exports = router;
