// ChatMessage.js
import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function ChatMessage({ role, content }) {
    // Check if the message contains a code block using backticks
    const isCodeBlock = content.includes("```");

    // Renders the content based on whether it’s code or regular text
    const renderContent = () => {
        if (isCodeBlock) {
            // Extract code within triple backticks
            const codeContent = content.replace(/```[a-z]*\n?|```$/g, "");
            return (
                <SyntaxHighlighter language="javascript" style={docco} wrapLongLines={true}>
                    {codeContent}
                </SyntaxHighlighter>
            );
        } else {
            return <span>{content}</span>;
        }
    };

    return (
        <div style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', backgroundColor: role === 'You' ? '#e0f7fa' : '#f1f3f5' }}>
            <strong>{role}:</strong> {renderContent()}
        </div>
    );
}

export default ChatMessage;