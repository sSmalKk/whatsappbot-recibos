// routes/index.js
const express = require("express");
const router = express.Router();
const whatsappRoutes = require("./services/whatsappRoutes");
const googleScriptRoutes = require("./services/googleScriptRoutes"); // Importa o novo módulo

router.use(require("./admin/index"));
router.use(require("./device/v1/index"));
router.use(require("./client/v1/index"));
router.use("/whatsapp", whatsappRoutes);
router.use("/google-script", googleScriptRoutes); // Adiciona a rota do Google Script

module.exports = router;
