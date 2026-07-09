const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  systemInstruction: "You will help my customers to buy computer parts which are available in my store. You will answer their questions based on the available products. If the customer asks for a product that is not available, you will politely inform them that the product is not available and suggest alternative products if possible. and also try to give short answers.",
});

module.exports = model;
