const express = require('express');
const dotenv = require('dotenv');
const { Anthropic } = require('@anthropic-ai/sdk');
const cors = require('cors');  

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());  // Allow all origins for testing; restrict in production as needed

console.log("Loaded API Key:", process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    try {
        console.log("Received message from client:", message);

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            messages: [{ role: "user", content: message }],
            max_tokens: 4096,
            temperature: 0.7,
            stream: false
        });

        console.log("API response:", response);

        if (response && response.content) {
            const fullResponse = response.content.map(block => block.text).join('');
            res.json({
                reply: fullResponse,
                inputTokens: response.usage?.input_tokens || 0,
                outputTokens: response.usage?.output_tokens || 0,
            });
        } else {
            console.error("Unexpected response format or empty response from Claude API");
            res.status(500).json({ error: "Unexpected response format or empty response from Claude API" });
        }

    } catch (error) {
        console.error("Error calling Claude API:", error);

        res.status(500).json({
            error: 'Unexpected error communicating with Claude API',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});