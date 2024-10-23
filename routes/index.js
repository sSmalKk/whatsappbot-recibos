// routes/index.js
const express = require("express");
const router = express.Router();
const whatsappRoutes = require("./services/whatsappRoutes");
const xlsxImporterRoutes = require("./services/xlsxImporter"); // Importa o novo módulo

 router.use("/whatsapp", whatsappRoutes);

module.exports = router;
