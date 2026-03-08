try { require('dotenv').config(); } catch (e) { }
const express = require('express');
const cors = require('cors');

const app = express();

const BEDROCK_BASE_URL = process.env.BEDROCK_BASE_URL || 'https://bedrock-mantle.eu-north-1.api.aws/v1';
const BEDROCK_API_KEY = process.env.BEDROCK_API_KEY || '';
const PORT = process.env.PORT || 3099;

// Allow all origins explicitly
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors()); // Automatically reply to OPTIONS requests

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('*/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Proxy POST requests to Bedrock, ignoring any API Gateway path prefixes
app.post('*/chat/completions', async (req, res) => {
    try {
        const response = await fetch(`${BEDROCK_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BEDROCK_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Bedrock proxy server running on http://localhost:${PORT}`);
    console.log(`Proxying to: ${BEDROCK_BASE_URL}`);
});

module.exports = app;
