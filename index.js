const express = require('express')
const generateResponse = require('./responceGen.js')
require('dotenv').config()

const port = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.post('/gemini', async (req, res) => {
    const prompt = req.body
    const generatedResponse = await generateResponse(prompt.prompt)
    res.json(generatedResponse)
    
})


app.listen(port, () => {
    console.log(`Server is live on port ${port}`)
})