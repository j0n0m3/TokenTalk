// ChatWindow.js
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Typography, Input, Button } from 'antd';

function ChatWindow({ messages, inputMessage, setInputMessage, handleSend, chatName }) {
    const messageContainerRef = useRef(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

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
                    <ChatMessage key={index} role={msg.role} content={msg.content} />
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <Input.TextArea
                    rows={1}
                    autoSize={{ minRows: 1, maxRows: 6 }}
                    placeholder="Type a message (Shift+Enter for line break)..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    style={{ flex: 1, resize: 'none' }}
                />
                <Button type="primary" onClick={handleSend} style={{ marginLeft: '8px' }}>
                    Send
                </Button>
            </div>
        </div>
    );
}

export default ChatWindow;
