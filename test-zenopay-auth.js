const { default: nodeFetch } = require('node-fetch');

// Test ZenoPay API with authentication
const testZenoPayAuth = async () => {
    console.log('Testing ZenoPay API with authentication...');
    
    // Using the same API key from server.js
    const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';
    const ZENO_API_URL = 'https://zenoapi.com/api/payments/mobile_money_tanzania';
    
    try {
        console.log('Testing ZenoPay main API endpoint with auth...');
        const response = await nodeFetch(ZENO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ZENO_API_KEY
            },
            body: JSON.stringify({
                order_id: 'test_auth_' + Date.now(),
                buyer_email: 'test@youtubeautomation.com',
                buyer_name: 'Test User',
                buyer_phone: '0712345678',
                amount: 5000
            })
        });
        
        console.log(`Main API Status: ${response.status}`);
        const responseText = await response.text();
        console.log(`Main API Response: ${responseText || '(empty)'}`);
        
        // Try to parse JSON response
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log('Parsed JSON Response:', jsonResponse);
        } catch (parseError) {
            console.log('Response is not valid JSON');
        }
    } catch (error) {
        console.log(`Main API Error: ${error.message}`);
        console.log('Error details:', error);
    }
};

testZenoPayAuth();