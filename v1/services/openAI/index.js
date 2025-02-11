const { OpenAI } = require('openai')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Função para processar mensagens usando OpenAI API
async function processAndAnswerMessage (text) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: text }]
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Erro na OpenAI API:', error)
    return 'Desculpe, não entendi. Pode reformular?'
  }
}

module.exports = {
  processAndAnswerMessage
}
