import React, { useState, useEffect } from 'react';
import { Typography, Button, Divider, List, Empty, Input } from 'antd';
import { PlusOutlined, EditOutlined, MenuOutlined, SaveOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

function ChatSidebar({
    chatHistory = [],
    setCurrentChatId,
    startNewChat,
    renameChat,
    saveChat,
    isCollapsed,
    toggleCollapse,
    currentChatId,
    deleteChat,
    systemPrompt,
    setSystemPrompt,
}) {
    const [isPromptLocked, setIsPromptLocked] = useState(true); // Locked by default

    useEffect(() => {
        const storedPrompt = localStorage.getItem('systemPrompt');
        if (storedPrompt) {
            setSystemPrompt(storedPrompt);
        }
    }, [setSystemPrompt]);

    const handlePromptChange = (e) => {
        const newPrompt = e.target.value;
        setSystemPrompt(newPrompt);
        localStorage.setItem('systemPrompt', newPrompt);
    };

    return (
        <div
            style={{
                width: isCollapsed ? '60px' : '220px',
                height: '100vh',
                padding: isCollapsed ? '5px' : '15px 10px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRight: '1px solid #e8e8e8',
                transition: 'width 0.3s ease',
            }}
        >
            <Button
                icon={<MenuOutlined />}
                onClick={toggleCollapse}
                style={{
                    marginBottom: '10px',
                    width: '100%',
                    fontSize: '18px',
                    display: 'flex',
                    justifyContent: 'center',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
                }}
            />

            {!isCollapsed && <Divider style={{ width: '100%', margin: '10px 0' }} />}

            {!isCollapsed && (
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={startNewChat}
                        style={{
                            marginBottom: '8px',
                            width: '100%',
                            fontSize: '14px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        New Chat
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={renameChat}
                        style={{
                            marginBottom: '8px',
                            width: '100%',
                            fontSize: '14px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        Rename Chat
                    </Button>
                    <Button
                        icon={<SaveOutlined />}
                        onClick={saveChat}
                        style={{
                            width: '100%',
                            fontSize: '14px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        Save Chat
                    </Button>
                </div>
            )}

            {!isCollapsed && <Divider style={{ width: '100%', margin: '10px 0' }} />}

            {!isCollapsed && (
                <>
                    <Typography.Text type="secondary" style={{ marginBottom: '8px', fontSize: '12px', color: '#595959' }}>
                        Chat History
                    </Typography.Text>
                    <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
                        {chatHistory.length > 0 ? (
                            <List
                                dataSource={chatHistory}
                                renderItem={(chat) => (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '5px',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: chat.id === currentChatId ? '#e6f7ff' : '#ffffff',
                                            transition: 'all 0.3s ease',
                                            boxShadow: chat.id === currentChatId ? '0 2px 6px rgba(0, 0, 0, 0.1)' : 'none',
                                        }}
                                    >
                                        <Button
                                            type="text"
                                            onClick={() => setCurrentChatId(chat.id)}
                                            style={{
                                                textAlign: 'left',
                                                width: '85%',
                                                padding: '8px',
                                                color: chat.id === currentChatId ? '#1890ff' : '#333',
                                                fontWeight: chat.id === currentChatId ? 'bold' : 'normal',
                                                backgroundColor: 'transparent',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <Typography.Text style={{ fontSize: '12px' }}>
                                                {chat.name}
                                            </Typography.Text>
                                        </Button>
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteChat(chat.id)}
                                            style={{
                                                color: '#ff4d4f',
                                                padding: '4px',
                                                border: 'none',
                                                background: 'none',
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        ) : (
                            <Empty
                                description="No chat history available"
                                style={{
                                    marginTop: '20px',
                                    textAlign: 'center',
                                    color: '#999',
                                }}
                            />
                        )}
                    </div>
                </>
            )}

            {!isCollapsed && <Divider style={{ width: '100%', marginTop: '10px' }} />}

            {!isCollapsed && (
                <div style={{
                    width: '100%',
                    marginBottom: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '90%', marginBottom: '6px' }}>
                        <Typography.Text 
                            type="secondary" 
                            style={{ fontSize: '12px', color: '#595959', flex: 1 }}
                        >
                            System Prompt
                        </Typography.Text>
                        <Button
                            type="text"
                            icon={isPromptLocked ? <LockOutlined /> : <UnlockOutlined />}
                            onClick={() => setIsPromptLocked(!isPromptLocked)}
                            style={{
                                fontSize: '16px',
                                color: isPromptLocked ? '#ff4d4f' : '#1890ff',
                                padding: '0 4px',
                            }}
                        />
                    </div>
                    <Input.TextArea
                        value={systemPrompt}
                        onChange={handlePromptChange}
                        placeholder="Enter system prompt"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        style={{
                            width: '100%',
                            pointerEvents: isPromptLocked ? 'none' : 'auto',
                            opacity: isPromptLocked ? 0.6 : 1,
                            borderRadius: '4px',
                            fontSize: '12px',
                        }}
                        disabled={isPromptLocked}
                    />
                </div>
            )}
        </div>
    );
}

export default ChatSidebar;