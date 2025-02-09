require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");
const path = require('path');
const enums = require('./enums');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB conectado"))
    .catch(err => console.error("Erro ao conectar ao MongoDB", err));

// Webhook de verificação do Instagram
app.get("/privacidade", (req, res) => {
    return res.sendFile(path.join(__dirname,'privacidade.html'));
});

// Webhook de verificação do Instagram
app.get("/webhook", (req, res) => {
    if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
        res.send(req.query["hub.challenge"]);
    } else {
        res.send("Token de verificação inválido.");
    }
});

// Endpoint para receber mensagens do Instagram
app.post("/webhook", async (req, res) => {
    const body = req.body;
    if (body.object === "instagram") {
        body.entry.forEach(async (entry) => {
            const messaging = entry.messaging[0];
            if (messaging && messaging.message && !messaging.message.is_echo) {
                const senderId = messaging.sender.id;
                const messageText = messaging.message.text;

                // insere mensagem no banco
                await mongoose.connection.db.collection('messages').insertOne({
                    senderId: senderId,
                    message: messageText,
                    timestamp: new Date(),
                    ttl: new Date(Date.now() + 60 * 1000) // 60 segundos
                });

                // procura table lock
                const tableLockResponse = await mongoose.connection.db.collection(enums.TABLE_LOCK_COLLECTION_NAME).findOne({
                    senderId: senderId
                });

                if (!tableLockResponse) {
                    // insere table lock para acumular mensagens enquanto existir esse documento
                    await mongoose.connection.db.collection(enums.TABLE_LOCK_COLLECTION_NAME).insertOne({
                        senderId: senderId,
                        timestamp: new Date(),
                        ttl: new Date(Date.now() + enums.TABLE_LOCK_TTL_IN_MS)
                    });

                    setTimeout(async () => {
                        const joinedMessages = await processBatchOfMessages(senderId);
                        const answer = await processMessageWithGPT(joinedMessages);
                        await sendMessage(senderId, answer);
                    }, enums.TABLE_LOCK_TTL_IN_MS)
                } else {
                    console.log(`Message from user ${senderId} saved but process finished waiting more messages: ${messageText}`)
                }
            }
        });

        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

const processBatchOfMessages = async (senderId) => {
    const messages = await mongoose.connection.db.collection('messages').find({
        senderId: senderId
    }).toArray();

    const joinedMessages = messages.map(message => message.message).join('\n');

    return joinedMessages;
}

// Função para processar mensagens usando OpenAI API
async function processMessageWithGPT(text) {
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
        const IGResponse = await axios.post(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: recipientId },
                message: { text }
            }
        );
        console.log('Instagram response', IGResponse);
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error.response ? error.response.data : error.message);
    }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
