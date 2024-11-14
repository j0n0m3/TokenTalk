// ChatMessage.js
import React from 'react';
import { Typography, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import moment from 'moment';

const ChatMessage = ({ role, content, timestamp }) => {
    const isUser = role === 'You';

    // Detect code blocks within the message content
    const formatContent = (content) => {
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const parts = content.split(codeRegex);

        return parts.map((part, index) => {
            if (index % 3 === 2) {
                const language = parts[index - 1] || 'javascript';
                return (
                    <div key={index} style={{ position: 'relative', marginBottom: '10px' }}>
                        <SyntaxHighlighter
                            language={language}
                            style={nightOwl}
                            showLineNumbers
                            customStyle={{
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#011627', // Dark background for nightOwl theme
                                color: '#d6deeb', // Light font color for readability
                                overflowX: 'auto',
                                fontSize: '14px',
                            }}
                        >
                            {part}
                        </SyntaxHighlighter>
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => navigator.clipboard.writeText(part)}
                            size="small"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: 'none',
                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            Copy
                        </Button>
                    </div>
                );
            } else if (index % 3 === 0) {
                return <span key={index}>{part}</span>;
            }
            return null;
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-start' : 'flex-end', marginBottom: '15px' }}>
            <Typography.Text style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                {moment(timestamp).format('MM/DD/YYYY - h:mm:ss A')}
            </Typography.Text>
            <div style={{
                maxWidth: '75%',
                padding: '10px 15px',
                backgroundColor: isUser ? 'rgba(230, 230, 230, 0.3)' : 'rgba(144, 238, 144, 0.3)', // Soft gray for user, light green for assistant
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.2)',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                textAlign: 'left',
            }}>
                <Typography.Text
                    style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isUser ? '#52c41a' : '#096dd9',
                    }}
                >
                    {role}
                </Typography.Text>
                <div style={{ marginTop: '5px', fontSize: '14px', color: '#333' }}>
                    {formatContent(content)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;