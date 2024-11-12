// TokenTicker.js
import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';

function TokenTicker({ inputTokens, outputTokens }) {
    const [usage, setUsage] = useState({ tokens: 0, cost: 0 });

    useEffect(() => {
        if (inputTokens || outputTokens) {
            const newTokenCount = usage.tokens + inputTokens + outputTokens;
            const newCost = newTokenCount * 0.000003;
            setUsage({ tokens: newTokenCount, cost: newCost });
        }
    }, [inputTokens, outputTokens]);

    return (
        <div 
            style={{
                padding: '5px 10px',  // Adjusted padding to reduce space
                backgroundColor: '#e0e3e8',
                textAlign: 'center',
                borderBottom: '1px solid #ddd',
            }}
        >
            <Typography.Text type="secondary">
                <strong>Total Tokens Used:</strong> {usage.tokens} | <strong>Current Costs:</strong> ${usage.cost.toFixed(5)}
            </Typography.Text>
        </div>
    );
}

export default TokenTicker;