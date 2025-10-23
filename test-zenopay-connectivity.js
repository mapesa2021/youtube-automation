const { default: nodeFetch } = require('node-fetch');

// Test ZenoPay API connectivity
const testZenoPayConnectivity = async () => {
    console.log('Testing ZenoPay API connectivity...');
    
    // Test main payment endpoint
    try {
        console.log('Testing ZenoPay main API endpoint...');
        const response = await nodeFetch('https://zenoapi.com/api/payments/mobile_money_tanzania', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: true
            })
        });
        
        console.log(`Main API Status: ${response.status}`);
        const responseText = await response.text();
        console.log(`Main API Response: ${responseText || '(empty)'}`);
    } catch (error) {
        console.log(`Main API Error: ${error.message}`);
    }
    
    console.log('---');
    
    // Test order status endpoint
    try {
        console.log('Testing ZenoPay order status endpoint...');
        const response = await nodeFetch('https://zenoapi.com/api/payments/order-status?order_id=test', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Order Status API Status: ${response.status}`);
        const responseText = await response.text();
        console.log(`Order Status API Response: ${responseText || '(empty)'}`);
    } catch (error) {
        console.log(`Order Status API Error: ${error.message}`);
    }
    
    console.log('---');
    
    // Test DNS resolution
    const { lookup } = require('dns').promises;
    try {
        console.log('Testing DNS resolution for zenoapi.com...');
        const result = await lookup('zenoapi.com');
        console.log(`DNS Resolution Result:`, result);
    } catch (error) {
        console.log(`DNS Resolution Error: ${error.message}`);
    }
};

testZenoPayConnectivity();