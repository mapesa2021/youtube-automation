const { default: fetch } = require('node-fetch');

// Test the local payment endpoint
const testPayment = async () => {
    try {
        console.log('Testing payment processing...');
        
        const response = await fetch('http://localhost:3001/api/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: '0754546567'
            })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Error testing payment:', error.message);
    }
};

testPayment();