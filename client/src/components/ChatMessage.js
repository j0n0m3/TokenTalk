// ChatMessage.js
import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

function ChatMessage({ role, content }) {
    // Function to detect if the message contains a code block and extract language
    const detectLanguage = (text) => {
        const match = text.match(/```([a-z]*)/i);
        return match ? match[1] : 'plaintext';
    };

    const isCodeBlock = content.includes("```");

    // Function to handle copying the code to clipboard
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    // Function to render the message content based on whether it contains a code block
    const renderContent = () => {
        if (isCodeBlock) {
            const language = detectLanguage(content);
            const codeContent = content.replace(/```[a-z]*\n?|```$/g, "");

            return (
                <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden' }}>
                    <SyntaxHighlighter language={language} style={atomOneLight} wrapLongLines={true}>
                        {codeContent}
                    </SyntaxHighlighter>
                    <Tooltip title="Copy code">
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => handleCopy(codeContent)}
                            style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                fontSize: '12px',
                                padding: '3px 7px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                border: 'none',
                                boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
                            }}
                        />
                    </Tooltip>
                </div>
            );
        } else {
            return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;
        }
    };

    return (
        <div
            style={{
                marginBottom: '10px',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: role === 'You' ? 'rgba(231, 245, 255, 0.8)' : 'rgba(232, 255, 241, 0.8)',
                border: '1px solid rgba(200, 200, 200, 0.5)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                position: 'relative',
            }}
        >
            <strong>{role}:</strong>
            <div style={{ marginTop: '4px' }}>
                {renderContent()}
            </div>
        </div>
    );
}

export default ChatMessage;