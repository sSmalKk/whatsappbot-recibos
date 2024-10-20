const express = require("express");
const router = express.Router();
const whatsappService = require("../../services/whatsappService");

// Route to send messages via WhatsApp
router.post("/send-message", async (req, res) => {
  console.log('Received body:', req.body); // Add this to debug
  const { chatId, message } = req.body;
  if (!chatId || !message) {
    return res.status(400).json({ error: "chatId and message are required" });
  }
  try {
    const result = await whatsappService.sendMessage(chatId, message);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router; // Export the router
