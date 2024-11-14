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
        const loadChatsFromServer = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/loadChats');
                setChatHistory(response.data);
            } catch (error) {
                console.error("Error loading chats from server:", error);
            }
        };

        loadChatsFromServer();
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
            console.error("Error saving chat to server:", error);
        }
    };

    const renameChat = async () => {
        const newName = prompt("Enter a new name for this chat:", chatName);
        if (newName && newName !== chatName) {
            setChatName(newName);

            setChatHistory(prevHistory =>
                prevHistory.map(chat =>
                    chat.id === currentChatId ? { ...chat, name: newName } : chat
                )
            );

            await saveChat();
        }
    };

    const startNewChat = () => {
        saveChat(); // Save the current chat before starting a new one
        setMessages([]);
        setInputMessage("");
        const newChatId = uuidv4();
        setCurrentChatId(newChatId);
        setChatName("New Chat");

        setChatHistory(prevHistory => [
            ...prevHistory,
            { id: newChatId, name: "New Chat", messages: [] }
        ]);
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
                startNewChat(); // Start a new chat if the current chat was deleted
            }
        } catch (error) {
            console.error("Error deleting chat from server:", error);
        }
    };

    const handleSend = async (messageContent) => {
        if (!messageContent.trim()) return;

        const userMessage = { role: 'You', content: messageContent };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputMessage("");

        try {
            const response = await axios.post('http://localhost:5001/api/chat', {
                message: messageContent,
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
                console.error("Unexpected response format from server:", response.data);
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
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <ChatSidebar
                chatHistory={chatHistory}
                setCurrentChatId={loadChatFromHistory}
                startNewChat={startNewChat}
                renameChat={renameChat}
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
                    setMessages={setMessages}
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