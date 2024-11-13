// app.js
require('dotenv').config();
const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk'); // For Claude API interaction
const sqlite3 = require('sqlite3').verbose(); // Use SQLite for storing token usage data

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Azure Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient("chathistory");

// Initialize the SQLite database
const db = new sqlite3.Database(':memory:'); // Replace with persistent database path

// Create the TokenUsage table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS TokenUsage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_date TEXT,
            input_tokens INTEGER,
            output_tokens INTEGER,
            total_cost REAL
        )
    `);
});

// Initialize Anthropic (Claude) Client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Endpoint to save chat to Azure Blob Storage
app.post('/api/saveChat', async (req, res) => {
    const { chatId, chatData } = req.body;

    try {
        const blobName = `${chatId}.json`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(JSON.stringify(chatData), JSON.stringify(chatData).length);
        res.status(200).json({ message: 'Chat saved successfully.' });
    } catch (error) {
        console.error("Error saving chat to Azure Blob:", error);
        res.status(500).json({ error: 'Error saving chat.' });
    }
});

// Endpoint to load all chats from Azure Blob Storage
app.get('/api/loadChats', async (req, res) => {
    try {
        const chatList = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
            const downloadBlockBlobResponse = await blockBlobClient.download(0);
            const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
            chatList.push(JSON.parse(downloaded));
        }
        res.status(200).json(chatList);
    } catch (error) {
        console.error("Error loading chats from Azure Blob:", error);
        res.status(500).json({ error: 'Error loading chats.' });
    }
});

// Endpoint to delete a chat from Azure Blob Storage
app.delete('/api/deleteChat/:chatId', async (req, res) => {
    const { chatId } = req.params;
    try {
        const blobName = `${chatId}.json`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
        res.status(200).json({ message: 'Chat deleted successfully.' });
    } catch (error) {
        console.error("Error deleting chat from Azure Blob:", error);
        res.status(500).json({ error: 'Error deleting chat.' });
    }
});

// Endpoint to save weekly token usage data
app.post('/api/saveTokenUsage', (req, res) => {
    const { startDate, inputTokens, outputTokens } = req.body;
    const totalTokens = inputTokens + outputTokens;
    const totalCost = totalTokens * 0.000003; // Adjust cost rate as needed

    db.run(
        `INSERT INTO TokenUsage (start_date, input_tokens, output_tokens, total_cost) VALUES (?, ?, ?, ?)`,
        [startDate, inputTokens, outputTokens, totalCost],
        function (err) {
            if (err) {
                console.error("Error saving token usage:", err);
                return res.status(500).json({ error: "Error saving token usage." });
            }
            res.status(200).json({ message: "Token usage saved successfully." });
        }
    );
});

// Endpoint to retrieve token usage history
app.get('/api/getTokenUsageHistory', (req, res) => {
    db.all(`SELECT * FROM TokenUsage ORDER BY start_date DESC`, (err, rows) => {
        if (err) {
            console.error("Error retrieving token usage history:", err);
            return res.status(500).json({ error: "Error retrieving token usage history." });
        }
        res.status(200).json(rows);
    });
});

// Chat endpoint to interact with Claude (Anthropic API)
app.post('/api/chat', async (req, res) => {
    const { message, systemPrompt } = req.body;

    console.log("Received System Prompt:", systemPrompt);

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            system: systemPrompt,
            messages: [
                { role: "user", content: message }
            ],
            temperature: 0.7,
            stream: false,
        });

        if (response && response.content) {
            res.json({
                reply: response.content.map(block => block.text).join(''),
                inputTokens: response.usage?.input_tokens || 0,
                outputTokens: response.usage?.output_tokens || 0,
            });
        } else {
            console.error("Unexpected response format from Claude API");
            res.status(500).json({ error: "Unexpected response format from Claude API" });
        }
    } catch (error) {
        console.error("Error calling Claude API:", error);
        res.status(500).json({
            error: 'Unexpected error communicating with Claude API',
            details: error.message
        });
    }
});

// Utility function to read stream to string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});