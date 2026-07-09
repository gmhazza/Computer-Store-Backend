const gemini = require('./gemini/index.js')

async function generateResponse(prompt) {
  try {
    const response = await gemini.generateContent(prompt);
    const result = await response.response.text();
    return {
        success: true,
        data: result
    };
  }
  catch (error) {
    console.error('Error generating response:', error);
    return {
      success: false,
      message: 'Error generating response'
    };
  }
}

module.exports = generateResponse;