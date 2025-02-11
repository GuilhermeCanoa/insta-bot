const axios = require('axios')

// Função para enviar mensagens via Messenger API
async function sendMessage (recipientId, text) {
  try {
    const IGResponse = await axios.post(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
            {
              recipient: { id: recipientId },
              message: { text }
            }
    )
    console.log('Instagram response', IGResponse)
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response ? error.response.data : error.message)
  }
}

module.exports = {
  sendMessage
}
