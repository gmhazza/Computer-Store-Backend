const express = require('express')
const generateResponse = require('./responceGen.js')
require('dotenv').config()

const supabase = require('./database/supabase.js')

const port = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.post('/gemini', async (req, res) => {
    const prompt = req.body
    try {
        const { data, error } = await supabase.from('products').select('*')
        prompt.prompt += '\n I am also providing you available products. Answer the question based on the available products if necessary. Here are the available products: ' + JSON.stringify(data)
    } catch (error) {
        console.error('Error fetching products from Supabase:', error);
        res.status(500).json({ success: false, message: 'Error fetching products from Supabase' });
        return;
    }

    const generatedResponse = await generateResponse(prompt.prompt)
    res.json(generatedResponse)
    
})


app.listen(port, () => {
    console.log(`Server is live on port ${port}`)
})