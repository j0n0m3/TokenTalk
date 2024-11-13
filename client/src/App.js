// App.js
import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatSidebar from './components/ChatSidebar';
import TokenTicker from './components/TokenTicker';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

function App() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(uuidv4());
    const [chatName, setChatName] = useState("New Chat");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [tokenUsage, setTokenUsage] = useState({ inputTokens: 0, outputTokens: 0 });
    const [systemPrompt, setSystemPrompt] = useState("Default system prompt text.");

    useEffect(() => {
        const loadChatsFromAzure = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/loadChats');
                setChatHistory(response.data);
            } catch (error) {
                console.error("Error loading chats from Azure:", error);
            }
        };

        loadChatsFromAzure();
    }, []);

    const saveChat = async () => {
        const chatData = { id: currentChatId, name: chatName, messages: [...messages] };

        try {
            await axios.post('http://localhost:5001/api/saveChat', {
                chatId: currentChatId,
                chatData,
            });

            setChatHistory((prevHistory) => {
                const existingChatIndex = prevHistory.findIndex(chat => chat.id === currentChatId);
                if (existingChatIndex !== -1) {
                    const updatedHistory = [...prevHistory];
                    updatedHistory[existingChatIndex] = chatData;
                    return updatedHistory;
                } else {
                    return [...prevHistory, chatData];
                }
            });
        } catch (error) {
            console.error("Error saving chat to Azure:", error);
        }
    };

    const renameChat = async () => {
        const newName = prompt("Enter a new name for this chat:", chatName);
        if (newName && newName !== chatName) {
            setChatName(newName);

            // Update the name in chatHistory
            setChatHistory(prevHistory => 
                prevHistory.map(chat => 
                    chat.id === currentChatId ? { ...chat, name: newName } : chat
                )
            );

            // Save the updated chat to Azure Blob Storage
            await saveChat(); 
        }
    };

    const startNewChat = () => {
        saveChat();
        setMessages([]);
        setInputMessage("");
        setCurrentChatId(uuidv4());
        setChatName("New Chat");
    };

    const loadChatFromHistory = (chatId) => {
        const selectedChat = chatHistory.find(chat => chat.id === chatId);
        if (selectedChat) {
            setCurrentChatId(selectedChat.id);
            setChatName(selectedChat.name);
            setMessages(selectedChat.messages);
        }
    };

    const deleteChat = async (chatId) => {
        try {
            await axios.delete(`http://localhost:5001/api/deleteChat/${chatId}`);
            setChatHistory((prevHistory) => prevHistory.filter(chat => chat.id !== chatId));
            if (chatId === currentChatId) {
                startNewChat();
            }
        } catch (error) {
            console.error("Error deleting chat from Azure:", error);
        }
    };

    const handleSend = async () => {
        if (inputMessage.trim()) {
            const userMessage = { role: 'You', content: inputMessage };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInputMessage("");

            try {
                console.log("System Prompt being sent:", systemPrompt);
                const response = await axios.post('http://localhost:5001/api/chat', {
                    message: inputMessage,
                    systemPrompt,
                });

                if (response.data && response.data.reply) {
                    const assistantMessage = { role: 'Claude', content: response.data.reply };
                    setMessages((prevMessages) => [...prevMessages, assistantMessage]);

                    const inputTokens = response.data.inputTokens || 0;
                    const outputTokens = response.data.outputTokens || 0;
                    setTokenUsage(prev => ({
                        inputTokens: prev.inputTokens + inputTokens,
                        outputTokens: prev.outputTokens + outputTokens,
                    }));
                } else {
                    console.error("Unexpected response format:", response.data);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { role: 'Claude', content: "Error: Unexpected response format from server." }
                    ]);
                }
            } catch (error) {
                console.error("Error communicating with server:", error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: 'Claude', content: "Error: Unable to reach server." }
                ]);
            }
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <ChatSidebar
                chatHistory={chatHistory}
                setCurrentChatId={loadChatFromHistory}
                startNewChat={startNewChat}
                renameChat={renameChat} // Use the updated renameChat function
                saveChat={saveChat}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                deleteChat={deleteChat}
                currentChatId={currentChatId}
                systemPrompt={systemPrompt}
                setSystemPrompt={setSystemPrompt}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TokenTicker inputTokens={tokenUsage.inputTokens} outputTokens={tokenUsage.outputTokens} />
                <ChatWindow
                    messages={messages}
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    handleSend={handleSend}
                    chatName={chatName}
                />
            </div>
        </div>
    );
}

export default App;
