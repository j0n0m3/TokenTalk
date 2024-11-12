// client/src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',  // Ensure this matches your server's port
});

// Function to send a message to the Claude API via the backend
export const sendMessage = (message) => api.post('/chat', { message });

// Function to fetch chat history if implemented in the backend
export const fetchChatHistory = () => api.get('/chats');

// Function to fetch token usage from the backend
export const fetchTokenUsage = () => api.get('/token-usage');  // Ensure this matches the backend's endpoint