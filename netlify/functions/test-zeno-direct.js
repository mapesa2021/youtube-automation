// Direct test of ZenoPay status API
const { default: fetch } = require('node-fetch');

const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';

exports.handler = async (event, context) => {
    console.log('Direct ZenoPay test called');
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: ''
        };
    }
    
    try {
        const orderId = event.queryStringParameters?.orderId || 'yt_auto_1761220068188_n10ch2q96';
        console.log('Testing order ID:', orderId);
        
        const url = `https://zenoapi.com/api/payments/order-status?order_id=${orderId}`;
        console.log('Testing URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': ZENO_API_KEY
            }
        });
        
        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response text:', text);
        
        let parsed = null;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            console.log('Parse failed:', e.message);
        }
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderId,
                url: url,
                status: response.status,
                text: text,
                parsed: parsed,
                success: true
            })
        };
        
    } catch (error) {
        console.error('Test error:', error);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
