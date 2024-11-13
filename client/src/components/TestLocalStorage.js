// src/components/TestLocalStorage.js
import React, { useState, useEffect } from 'react';

function TestLocalStorage() {
    const [chatHistory, setChatHistory] = useState([]);

    // Load chat history from local storage on app start
    useEffect(() => {
        const storedChatHistory = localStorage.getItem("chatHistory");
        if (storedChatHistory) {
            setChatHistory(JSON.parse(storedChatHistory));
        }
    }, []);

    // Save chat history to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }, [chatHistory]);

    // Function to add a new chat item
    const addChat = () => {
        const newChat = { id: chatHistory.length + 1, name: `Chat ${chatHistory.length + 1}` };
        setChatHistory([...chatHistory, newChat]);
    };

    return (
        <div>
            <h3>Chat History</h3>
            <ul>
                {chatHistory.map(chat => (
                    <li key={chat.id}>{chat.name}</li>
                ))}
            </ul>
            <button onClick={addChat}>Add Chat</button>
        </div>
    );
}

export default TestLocalStorage;