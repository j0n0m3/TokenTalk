require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();
app.use(express.json());
app.use(cors());

const CLAUDE_MESSAGES_API_URL = 'https://api.anthropic.com/v1/messages';
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = process.env.CHAT_CONTAINER_NAME || 'chathistory';

const MAX_REQUEST_SIZE_BYTES = 900000; // Safe limit below 1 MB for Anthropic's API

function calculateByteSize(str) {
    return Buffer.byteLength(str, 'utf-8');
}

async function uploadChatHistory(chatData, fileName) {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const containerExists = await containerClient.exists();

        if (!containerExists) {
            console.log(`Creating container: ${containerName}`);
            await containerClient.create();
        }

        const blobClient = containerClient.getBlockBlobClient(fileName);
        await blobClient.upload(JSON.stringify(chatData), Buffer.byteLength(JSON.stringify(chatData)));
        console.log(`Chat data uploaded as blob with name: ${fileName}`);
    } catch (error) {
        console.error("Error uploading to Blob Storage:", error);
    }
}

// support for chunking
async function sendToClaudeAPI(message, systemPrompt = '') {
    const content = `${systemPrompt ? systemPrompt + '\n\n' : ''}${message}`;
    const contentSize = calculateByteSize(content);

    // Check if content within maximum allowed request size
    if (contentSize <= MAX_REQUEST_SIZE_BYTES) {
        return await sendClaudeRequest(content); // Single request if under limit
    } else {
        // Split message into chunks if it exceeds size limit
        console.log("Message exceeds size limit, chunking message...");
        const chunkedResponses = [];
        const words = message.split(' '); // Split message by words for chunking
        let chunk = '';
        
        for (const word of words) {
            // Check size if adding the word exceeds limit
            if (calculateByteSize(chunk + word) + calculateByteSize(systemPrompt) > MAX_REQUEST_SIZE_BYTES) {
                // Send current chunk and reset
                const response = await sendClaudeRequest(chunk, systemPrompt);
                chunkedResponses.push(response);
                chunk = word + ' ';
            } else {
                chunk += word + ' ';
            }
        }

        // Send last chunk if any words remain
        if (chunk) {
            const response = await sendClaudeRequest(chunk.trim(), systemPrompt);
            chunkedResponses.push(response);
        }

        // Combine all chunk responses
        return chunkedResponses.join('\n\n');
    }
}

async function sendClaudeRequest(content, systemPrompt = '') {
    try {
        const response = await axios.post(
            CLAUDE_MESSAGES_API_URL,
            {
                model: "claude-3-5-sonnet-20241022",
                messages: [{ role: "user", content }],
                max_tokens: 1024,
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                },
            }
        );

        console.log("Claude API response received");

        return response.data.content
            .filter(item => item.type === "text")
            .map(item => item.text)
            .join(" ");
    } catch (error) {
        if (error.response && error.response.status === 413) {
            console.error("Error: Request too large. Try reducing the message size.");
        } else {
            console.error("Error communicating with Claude API:", error);
        }
        throw error;
    }
}

app.post('/api/chat', async (req, res) => {
    const { message, systemPrompt } = req.body;
    console.log("Received chat request:", message);

    try {
        const replyContent = await sendToClaudeAPI(message, systemPrompt);

        const inputTokens = message.split(" ").length;
        const outputTokens = replyContent.split(" ").length;

        console.log(`Tokens used - Input: ${inputTokens}, Output: ${outputTokens}`);

        const chatData = {
            userMessage: message,
            assistantResponse: replyContent,
            inputTokens,
            outputTokens,
            timestamp: new Date().toISOString(),
        };

        const fileName = `chat_${Date.now()}.json`;
        await uploadChatHistory(chatData, fileName);

        res.json({
            reply: replyContent,
            inputTokens,
            outputTokens,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to process request with Claude API" });
    }
});

app.post('/api/saveChat', async (req, res) => {
    const chatData = req.body;
    const fileName = `chat_${Date.now()}.json`;

    try {
        await uploadChatHistory(chatData, fileName);
        res.status(200).send({ message: "Chat saved successfully" });
    } catch (error) {
        console.error("Error saving chat:", error);
        res.status(500).send({ error: "Failed to save chat data" });
    }
});

app.get('/api/getTokenUsageHistory', async (req, res) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const history = [];

        for await (const blob of containerClient.listBlobsFlat()) {
            const blobClient = containerClient.getBlobClient(blob.name);
            const downloadBlockBlobResponse = await blobClient.download();
            const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
            history.push(JSON.parse(downloaded));
        }

        res.json({ history });
    } catch (error) {
        console.error("Error fetching usage history:", error);
        res.status(500).json({ error: "Failed to fetch usage history" });
    }
});

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
