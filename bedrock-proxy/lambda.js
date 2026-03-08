const https = require('https');
const url = require('url');

exports.handler = async (event) => {
    const BEDROCK_API_KEY = process.env.BEDROCK_API_KEY || '';
    const BEDROCK_BASE_URL = process.env.BEDROCK_BASE_URL || 'https://bedrock-mantle.eu-north-1.api.aws/v1';

    // Universal CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    // 1. Handle CORS Preflight perfectly
    const method = (event.requestContext && event.requestContext.http && event.requestContext.http.method) || event.httpMethod || '';
    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }

    // 2. Safely parse incoming body
    let requestBody = event.body || '{}';
    if (event.isBase64Encoded && event.body) {
        try {
            requestBody = Buffer.from(event.body, 'base64').toString('utf-8');
        } catch (e) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Base64 decode failed.' }) };
        }
    }

    // 3. Make the API call using pure Node.js HTTPS (zero dependencies, 100% bulletproof)
    return new Promise((resolve) => {
        try {
            const targetUrl = new url.URL(`${BEDROCK_BASE_URL}/chat/completions`);
            const options = {
                hostname: targetUrl.hostname,
                path: targetUrl.pathname + targetUrl.search,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${BEDROCK_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: headers,
                        body: data
                    });
                });
            });

            req.on('error', (e) => {
                resolve({
                    statusCode: 500,
                    headers: headers,
                    body: JSON.stringify({ error: 'HTTPS Request Failed', details: String(e) })
                });
            });

            req.write(requestBody);
            req.end();
        } catch (e) {
            resolve({
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ error: 'Lambda crash before request', details: String(e) })
            });
        }
    });
};
