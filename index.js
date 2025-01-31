require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB conectado"))
    .catch(err => console.error("Erro ao conectar ao MongoDB", err));

// Webhook de verificação do Instagram
app.get("/webhook-insta-verify", (req, res) => {
    if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
        res.send(req.query["hub.challenge"]);
    } else {
        res.send("Token de verificação inválido.");
    }
});

// Endpoint para receber mensagens do Instagram
app.post("/webhook-insta-message", async (req, res) => {
    const body = req.body;

    if (body.object === "instagram") {
        body.entry.forEach(async (entry) => {
            const messaging = entry.messaging[0];
            if (messaging && messaging.message) {
                const senderId = messaging.sender.id;
                const messageText = messaging.message.text;

                // Processar a mensagem
                const reply = await processMessage(messageText);

                // Enviar resposta
                await sendMessage(senderId, reply);
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

// Função para processar mensagens usando OpenAI API
async function processMessage(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: text }]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Erro na OpenAI API:", error);
        return "Desculpe, não entendi. Pode reformular?";
    }
}

// Função para enviar mensagens via Messenger API
async function sendMessage(recipientId, text) {
    try {
        await axios.post(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: recipientId },
                message: { text }
            }
        );
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error.response ? error.response.data : error.message);
    }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
