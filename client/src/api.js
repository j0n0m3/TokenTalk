// client/src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api', 
});

export const sendMessage = (message, systemPrompt) => 
    api.post('/chat', { message, systemPrompt });

export const fetchChatHistory = () => api.get('/chats');

export const fetchTokenUsage = () => api.get('/token-usage'); 
