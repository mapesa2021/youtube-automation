// Netlify Function for processing payments
const { default: nodeFetch } = require('node-fetch');

// ZenoPay API configuration
const ZENO_API_URL = 'https://zenoapi.com/api/payments/mobile_money_tanzania';
const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({
                success: false,
                message: 'Method not allowed'
            })
        };
    }

    try {
        const { phoneNumber } = JSON.parse(event.body || '{}');
        
        // Validate phone number
        if (!phoneNumber || phoneNumber.trim() === '') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: 'Nambari ya simu ni lazima'
                })
            };
        }
        
        // Clean phone number
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        if (cleanNumber.length < 9 || cleanNumber.length > 13) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: 'Nambari ya simu si sahihi'
                })
            };
        }
        
        // Generate unique order ID
        const orderId = `yt_auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare payment data for ZenoPay API
        const paymentData = {
            order_id: orderId,
            buyer_email: 'student@youtubeautomation.com',
            buyer_name: 'YouTube Automation Student',
            buyer_phone: cleanNumber,
            amount: 5000
        };
        
        console.log('Processing payment for:', cleanNumber);
        console.log('Sending data to ZenoPay API:', JSON.stringify(paymentData));
        
        // Make API call to ZenoPay
        const response = await nodeFetch(ZENO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ZENO_API_KEY
            },
            body: JSON.stringify(paymentData)
        });
        
        console.log('ZenoPay API response status:', response.status);
        
        // Get the raw response text first for debugging
        const responseText = await response.text();
        console.log('ZenoPay API response text:', responseText);
        
        // Handle non-JSON responses
        if (!responseText.startsWith('{') && !responseText.startsWith('[')) {
            console.error('Received non-JSON response from ZenoPay API:', responseText);
            return {
                statusCode: 502,
                body: JSON.stringify({
                    success: false,
                    message: 'Tatizo la mawasiliano na mfumo wa malipo. Tafadhali jaribu tena baadaye.'
                })
            };
        }
        
        // Try to parse JSON
        let result;
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Response text was:', responseText);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    success: false,
                    message: 'Tatizo limetokea katika mchakato wa malipo. Tafadhali jaribu tena.'
                })
            };
        }
        
        // Check if ZenoPay API call was successful
        if (response.ok && result.status === 'success') {
            console.log('Payment request sent successfully:', result);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Maelekezo ya malipo yamepelekwa kwenye simu yako. Tafadhali fuata maelekezo ili kukamilisha malipo.',
                    phoneNumber: cleanNumber,
                    amount: 5000,
                    orderId: orderId
                })
            };
        } else {
            console.error('Payment request failed:', result);
            return {
                statusCode: response.status >= 400 ? response.status : 400,
                body: JSON.stringify({
                    success: false,
                    message: result.message || 'Malipo yameshindwa. Tafadhali jaribu tena.'
                })
            };
        }
        
    } catch (error) {
        console.error('Payment processing error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: 'Tatizo limetokea wakati wa kuunganisha na seva ya malipo. Tafadhali jaribu tena baadaye.'
            })
        };
    }
};