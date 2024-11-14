// components/ChatMessage.js
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import moment from 'moment';

const ChatMessage = ({ message, isUser }) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
                maxWidth: '100%',
            }}
        >
            <div
                style={{
                    backgroundColor: isUser ? '#daf1da' : '#f1f0f0',
                    color: '#333',
                    borderRadius: '12px',
                    padding: '10px 15px',
                    maxWidth: '80%', // Limit bubble width
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                }}
            >
                <div
                    style={{
                        fontSize: '0.9rem',
                        marginBottom: '5px',
                        color: '#555',
                        fontStyle: 'italic',
                    }}
                >
                    {moment(message.timestamp).format('LT')}
                </div>
                {message.type === 'text' ? (
                    <p style={{ margin: 0 }}>{message.content}</p>
                ) : (
                    <SyntaxHighlighter
                        language="javascript"
                        style={solarizedlight}
                        wrapLines={true}
                        wrapLongLines={true} // Ensure long lines wrap
                        codeTagProps={{
                            style: {
                                display: 'block',
                                maxWidth: '100%', // Limit code width to the bubble width
                                overflowX: 'auto', // Allow horizontal scrolling for extremely long lines
                                whiteSpace: 'pre-wrap', // Allow text wrapping within the code block
                            },
                        }}
                    >
                        {message.content}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;