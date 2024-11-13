// components/CodeBlock.js
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'; // or any theme you like
import { CopyOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const CodeBlock = ({ language, children }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        alert("Code copied to clipboard!");
    };

    return (
        <div style={{ position: 'relative', marginBottom: '1em' }}>
            <SyntaxHighlighter language={language} style={solarizedlight}>
                {children}
            </SyntaxHighlighter>
            <Tooltip title="Copy code">
                <Button
                    onClick={handleCopy}
                    icon={<CopyOutlined />}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '2px 8px',
                        fontSize: '12px',
                    }}
                />
            </Tooltip>
        </div>
    );
};

export default CodeBlock;