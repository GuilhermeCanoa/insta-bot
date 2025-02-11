require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const services = require('./v1/services');
const path = require('path');
const enums = require('./enums');

const app = express();
app.use(bodyParser.json());


const { openAIService, metaAPIService } = services;
const { messagesRepository, messagesLockTableRepository, messagesHistoryRepository } = require('./v1/repository');

messagesRepository.connect();
messagesLockTableRepository.connect();
messagesHistoryRepository.connect();

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
                await messagesRepository.insertOne({
                    senderId: senderId,
                    message: messageText,
                    timestamp: new Date(),
                    ttl: new Date(Date.now() + 60 * 1000) // 60 segundos
                });
                
                // insere mensagem no banco de historico
                await messagesHistoryRepository.insertOne({
                    senderId: senderId,
                    message: messageText,
                    timestamp: new Date(),
                });

                // procura table lock
                const tableLockResponse = await messagesLockTableRepository.findOne({
                    senderId: senderId
                });

                if (!tableLockResponse) {
                    // insere table lock para acumular mensagens enquanto existir esse documento
                    await messagesLockTableRepository.insertOne({
                        senderId: senderId,
                        timestamp: new Date(),
                        ttl: new Date(Date.now() + enums.TABLE_LOCK_TTL_IN_MS)
                    });

                    setTimeout(async () => {
                        const joinedMessages = await processBatchOfMessages(senderId);
                        const answer = await openAIService.processAndAnswerMessage(joinedMessages);
                        await metaAPIService.sendMessage(senderId, answer);
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
    const messages = await messagesRepository.findMany({
        senderId: senderId
    });

    const joinedMessages = messages.map(message => message.message).join('\n');

    return joinedMessages;
}

// TODO qlqr erro precisa deletar o table-lock

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
