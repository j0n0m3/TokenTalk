// ChatSidebar.js
import React from 'react';
import { Typography, Button, Divider, List, Empty } from 'antd';
import { FileOutlined, PlusOutlined, EditOutlined, MenuOutlined, DeleteOutlined } from '@ant-design/icons';

function ChatSidebar({
    chatHistory = [],
    setCurrentChatId,
    startNewChat,
    renameChat,
    isCollapsed,
    toggleCollapse,
    currentChatId,
    deleteChat
}) {
    return (
        <div
            style={{
                width: isCollapsed ? '60px' : '180px',
                height: '100vh',
                padding: isCollapsed ? '5px' : '10px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderRight: '1px solid #e8e8e8',
                transition: 'width 0.3s ease',
            }}
        >
            <Button
                icon={<MenuOutlined />}
                onClick={toggleCollapse}
                style={{
                    alignSelf: 'center',
                    marginBottom: '15px',
                    fontSize: '18px',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                }}
            />

            {!isCollapsed && (
                <>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={startNewChat}
                        block
                        style={{ marginBottom: '10px', fontSize: '12px' }}
                    >
                        New Chat
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={renameChat}
                        block
                        style={{ marginBottom: '15px', fontSize: '12px' }}
                    >
                        Rename Chat
                    </Button>

                    <Divider style={{ width: '100%', marginBottom: '10px' }} />

                    <Typography.Text type="secondary" style={{ marginBottom: '8px', fontSize: '12px' }}>
                        Upload Files
                    </Typography.Text>
                    <Button
                        icon={<FileOutlined />}
                        block
                        style={{ marginBottom: '15px', fontSize: '12px' }}
                    >
                        Choose Files
                    </Button>

                    <Divider style={{ width: '100%', marginBottom: '10px' }} />

                    <Typography.Text type="secondary" style={{ marginBottom: '8px', fontSize: '12px' }}>
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
                                            borderRadius: '4px',
                                            backgroundColor: chat.id === currentChatId ? '#e6f7ff' : '#ffffff',
                                            transition: 'all 0.3s ease',
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
                                            className={chat.id === currentChatId ? 'active-chat' : ''}
                                        >
                                            <Typography.Text
                                                style={{
                                                    fontSize: '12px',
                                                    color: chat.id === currentChatId ? '#1890ff' : '#333',
                                                }}
                                            >
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
        </div>
    );
}

export default ChatSidebar;