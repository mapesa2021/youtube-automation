const { default: nodeFetch } = require('node-fetch');

// Test different API endpoints and methods
const testApiCalls = async () => {
    const testData = {
        auth_id: '19250',
        id: '1821',
        payment_gateway: 'mobile',
        agree_terms: true,
        phone_number: '0712345678'
    };

    const endpoints = [
        'https://clubzilla.com/api/buy/subscription',
        'https://clubzilla.com/api/buy/subscription/',
        'https://www.clubzilla.com/api/buy/subscription'
    ];

    const methods = ['POST', 'GET', 'PUT'];

    for (const endpoint of endpoints) {
        for (const method of methods) {
            try {
                console.log(`Testing ${method} ${endpoint}`);
                
                const response = await nodeFetch(endpoint, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: method !== 'GET' ? JSON.stringify(testData) : undefined
                });

                console.log(`Status: ${response.status}`);
                console.log(`Headers:`, [...response.headers.entries()]);
                
                const responseText = await response.text();
                console.log(`Response: ${responseText || '(empty)'}`);
                console.log('---');
            } catch (error) {
                console.log(`Error: ${error.message}`);
                console.log('---');
            }
        }
    }
};

testApiCalls();