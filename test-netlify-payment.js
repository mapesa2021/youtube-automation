// Test script for Netlify payment functions
const { default: fetch } = require('node-fetch');

const BASE_URL = 'http://localhost:8888'; // Netlify dev server
// For production, replace with your Netlify site URL
// const BASE_URL = 'https://your-site-name.netlify.app';

async function testHealthCheck() {
    console.log('🔍 Testing health check...');
    try {
        const response = await fetch(`${BASE_URL}/.netlify/functions/health`);
        const data = await response.json();
        console.log('✅ Health check result:', data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

async function testPaymentProcessing() {
    console.log('🔍 Testing payment processing...');
    try {
        const response = await fetch(`${BASE_URL}/.netlify/functions/process-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: '0712345678'
            })
        });
        
        const data = await response.json();
        console.log('✅ Payment processing result:', data);
        
        if (data.success && data.orderId) {
            console.log('📋 Order ID:', data.orderId);
            return data.orderId;
        }
        return null;
    } catch (error) {
        console.error('❌ Payment processing failed:', error.message);
        return null;
    }
}

async function testPaymentStatus(orderId) {
    if (!orderId) {
        console.log('⚠️ No order ID provided, skipping status check');
        return;
    }
    
    console.log('🔍 Testing payment status check...');
    try {
        const response = await fetch(`${BASE_URL}/.netlify/functions/payment-status?orderId=${orderId}`);
        const data = await response.json();
        console.log('✅ Payment status result:', data);
        return data;
    } catch (error) {
        console.error('❌ Payment status check failed:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Starting Netlify payment function tests...\n');
    
    // Test 1: Health check
    const healthOk = await testHealthCheck();
    if (!healthOk) {
        console.log('❌ Health check failed, stopping tests');
        return;
    }
    
    console.log('');
    
    // Test 2: Payment processing
    const orderId = await testPaymentProcessing();
    if (!orderId) {
        console.log('❌ Payment processing failed, stopping tests');
        return;
    }
    
    console.log('');
    
    // Test 3: Payment status check
    await testPaymentStatus(orderId);
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Notes:');
    console.log('- Make sure Netlify dev server is running: netlify dev');
    console.log('- For production testing, update BASE_URL in this script');
    console.log('- Check Netlify function logs for detailed debugging');
}

// Run tests
runTests().catch(console.error);
