import React, { useState, useEffect } from 'react';
import { Typography, Popover, List, Divider } from 'antd';
import axios from 'axios';

function TokenTicker({ inputTokens = 0, outputTokens = 0 }) {
    const [usage, setUsage] = useState({ tokens: 0, cost: 0 });
    const [inputUsage, setInputUsage] = useState(0);
    const [outputUsage, setOutputUsage] = useState(0);
    const [history, setHistory] = useState([]);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState(getLastSunday());

    useEffect(() => {
        fetchUsageHistory();
    }, []);

    useEffect(() => {
        console.log("Updating token usage:", { inputTokens, outputTokens });

        if (inputTokens || outputTokens) {
            const newTokenCount = usage.tokens + inputTokens + outputTokens;
            const newCost = newTokenCount * 0.000003;
            setUsage({ tokens: newTokenCount, cost: newCost });
            setInputUsage((prevInputUsage) => prevInputUsage + inputTokens);
            setOutputUsage((prevOutputUsage) => prevOutputUsage + outputTokens);

            if (new Date().getDay() === 0) { // Save weekly data on Sundays
                saveWeeklyUsage(currentWeekStart || getLastSunday(), inputUsage, outputUsage);
                setCurrentWeekStart(getLastSunday());
                setInputUsage(0);
                setOutputUsage(0);
            }
        }
    }, [inputTokens, outputTokens]);

    const fetchUsageHistory = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/getTokenUsageHistory');
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching usage history:", error);
        }
    };

    const saveWeeklyUsage = async (startDate, inputTokens, outputTokens) => {
        const totalTokens = inputTokens + outputTokens;
        const totalCost = totalTokens * 0.000003;

        try {
            await axios.post('http://localhost:5001/api/saveTokenUsage', {
                startDate,
                inputTokens,
                outputTokens,
                totalCost
            });
            fetchUsageHistory(); // Refresh history after saving
        } catch (error) {
            console.error("Error saving weekly usage:", error);
        }
    };

    function getLastSunday() {
        const today = new Date();
        const lastSunday = new Date(today.setDate(today.getDate() - today.getDay()));
        return lastSunday.toISOString().split('T')[0];
    }

    const handlePopoverOpenChange = (open) => {
        setPopoverOpen(open);
    };

    const popoverContent = (
        <div style={{ maxWidth: '300px' }}>
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '10px',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <Typography.Text style={{ fontWeight: 'bold' }}>
                    {currentWeekStart || getLastSunday()} - Current
                </Typography.Text>
                <br />
                <Typography.Text>Total Tokens Used: {usage.tokens}</Typography.Text>
                <br />
                <Typography.Text>Total Costs: ${usage.cost.toFixed(5)}</Typography.Text>
            </div>
            
            <Divider style={{ margin: '8px 0' }} />
            <Typography.Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Past Weeks</Typography.Text>

            <List
                dataSource={history}
                renderItem={(item) => (
                    <List.Item style={{
                        padding: '8px 0',
                        textAlign: 'left',
                        color: '#555'
                    }}>
                        <Typography.Text>
                            {item.start_date} - {item.end_date}
                        </Typography.Text>
                        <br />
                        <Typography.Text>Total Tokens Used: {item.input_tokens + item.output_tokens}</Typography.Text>
                        <br />
                        <Typography.Text>Total Costs: ${item.total_cost.toFixed(5)}</Typography.Text>
                    </List.Item>
                )}
                locale={{ emptyText: "No historical data available" }}
            />
        </div>
    );

    return (
        <Popover
            content={popoverContent}
            title="Token Usage History"
            trigger="click"
            open={popoverOpen}
            onOpenChange={handlePopoverOpenChange}
            placement="bottom"
        >
            <div 
                style={{
                    padding: '5px 10px',
                    backgroundColor: '#e0e3e8',
                    textAlign: 'center',
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer'
                }}
            >
                <Typography.Text type="secondary" style={{ color: '#333' }}>
                    <strong>Total Tokens Used:</strong> {usage.tokens} | <strong>Current Costs:</strong> ${usage.cost.toFixed(5)}
                </Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ color: '#333' }}>
                    <strong>Total Input Tokens Used:</strong> {inputUsage} | <strong>Total Output Tokens Used:</strong> {outputUsage}
                </Typography.Text>
            </div>
        </Popover>
    );
}

export default TokenTicker;