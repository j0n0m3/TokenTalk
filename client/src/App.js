// App.js
import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatSidebar from './components/ChatSidebar';
import TokenTicker from './components/TokenTicker';
import { v4 as uuidv4 } from 'uuid';

function App() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(uuidv4());
    const [chatName, setChatName] = useState("Untitled Chat");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [tokenUsage, setTokenUsage] = useState({ inputTokens: 0, outputTokens: 0 });

    // Start a new chat session
    const startNewChat = () => {
        if (messages.length > 0) {
            const newChat = {
                id: currentChatId,
                name: chatName,
                messages: [...messages],
            };
            setChatHistory(prevHistory => [...prevHistory, newChat]);
        }
        setMessages([]);
        setInputMessage("");
        setCurrentChatId(uuidv4());
        setChatName("Untitled Chat");
    };

    // Load selected chat from history
    const loadChatFromHistory = (chatId) => {
        const selectedChat = chatHistory.find(chat => chat.id === chatId);
        if (selectedChat) {
            setCurrentChatId(selectedChat.id);
            setChatName(selectedChat.name);
            setMessages(selectedChat.messages);
        }
    };

    // Toggle sidebar collapse state
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Delete a chat from history
    const deleteChat = (chatId) => {
        setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
            startNewChat(); // Start a new chat if the deleted chat was active
        }
    };

    // Handle sending a message
    const handleSend = async () => {
        if (inputMessage.trim()) {
            const userMessage = { role: 'You', content: inputMessage };
            setMessages([...messages, userMessage]);
            setInputMessage("");

            try {
                const response = await fetch('http://localhost:5001/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: inputMessage }),
                });

                if (!response.ok) {
                    throw new Error(`API response was not ok: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Server response:", data);

                if (data && typeof data.reply === 'string') {
                    const assistantMessage = { role: 'Claude', content: data.reply };
                    setMessages(prevMessages => [...prevMessages, assistantMessage]);

                    setTokenUsage(prevUsage => ({
                        inputTokens: prevUsage.inputTokens + (data.inputTokens || 0),
                        outputTokens: prevUsage.outputTokens + (data.outputTokens || 0),
                    }));
                } else {
                    console.error("Unexpected response structure:", data);
                    setMessages(prevMessages => [
                        ...prevMessages,
                        { role: 'Claude', content: "Unexpected response structure from server." }
                    ]);
                }
            } catch (error) {
                console.error("Error fetching response from server:", error);
                setMessages(prevMessages => [
                    ...prevMessages,
                    { role: 'Claude', content: "Error communicating with server." }
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
                renameChat={() => setChatName(prompt("Enter a new name for this chat:", chatName) || chatName)}
                isCollapsed={isCollapsed}
                toggleCollapse={toggleSidebar}
                deleteChat={deleteChat} // Pass deleteChat function to ChatSidebar
                currentChatId={currentChatId} // Pass current chat ID to track the active chat
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