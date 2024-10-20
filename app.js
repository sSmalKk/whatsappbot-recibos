// app.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const whatsappRoutes = require("./routes/services/whatsappRoutes"); // Ajuste o caminho, se necessário

const app = express();
const httpServer = require("http").createServer(app);
const corsOptions = { origin: process.env.ALLOW_ORIGIN };

app.use(cors(corsOptions));

// Middleware para parsear o body de requisições
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Rotas do WhatsApp
app.use("/whatsapp", whatsappRoutes);

// Rota inicial simples
app.get("/", (req, res) => {
  res.render("index");
});

// Inicialização do cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Escaneie o QR code para conectar ao WhatsApp.");
});

client.on("ready", () => {
  console.log("Cliente WhatsApp pronto.");
});

client.initialize();

// Inicializando o servidor
httpServer.listen(process.env.PORT, () => {
  console.log(`Seu aplicativo está rodando na porta ${process.env.PORT}`);
});

module.exports = app;
