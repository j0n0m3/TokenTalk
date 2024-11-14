// ChatWindow.js

import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Typography, Input, Button } from 'antd';

function ChatWindow({ messages, setMessages, inputMessage, setInputMessage, handleSend, chatName }) {
    const messageContainerRef = useRef(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            handleSend(inputMessage);
            setInputMessage("");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', padding: '10px 20px', overflow: 'hidden' }}>
            <Typography.Title level={4} style={{ marginBottom: '10px' }}>{chatName}</Typography.Title>
            <div
                ref={messageContainerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '15px',
                }}
            >
                {messages.map((msg, index) => (
                    <ChatMessage key={index} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <Input.TextArea
                    rows={1}
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    placeholder="Type a message (Shift+Enter for line break)..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    style={{
                        flex: 1,
                        resize: 'none',
                        borderRadius: '8px',
                        marginRight: '10px',
                    }}
                />
                <Button
                    type="primary"
                    onClick={handleSendMessage}
                    style={{
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        padding: '0 20px',
                        lineHeight: '1',
                    }}
                >
                    Send
                </Button>
            </div>
        </div>
    );
}

export default ChatWindow;
