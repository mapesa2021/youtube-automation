// Simplified Netlify Function for processing payments
exports.handler = async (event, context) => {
    console.log('Simple process payment function called');
    
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Method not allowed'
            })
        };
    }

    try {
        console.log('Parsing request body...');
        const body = JSON.parse(event.body || '{}');
        console.log('Parsed body:', body);
        const { phoneNumber } = body;
        
        console.log('Received phone number:', phoneNumber);
        
        // Validate phone number
        if (!phoneNumber || phoneNumber.trim() === '') {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Nambari ya simu ni lazima'
                })
            };
        }
        
        // Clean phone number
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        console.log('Cleaned phone number:', cleanNumber);
        
        if (cleanNumber.length < 9 || cleanNumber.length > 13) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Nambari ya simu si sahihi'
                })
            };
        }
        
        // Generate unique order ID
        const orderId = `yt_auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Generated order ID:', orderId);
        
        // Prepare payment data for ZenoPay API
        const paymentData = {
            order_id: orderId,
            buyer_email: 'student@youtubeautomation.com',
            buyer_name: 'YouTube Automation Student',
            buyer_phone: cleanNumber,
            amount: 500
        };
        
        console.log('Processing payment for:', cleanNumber);
        console.log('Sending data to ZenoPay API:', JSON.stringify(paymentData));
        
        // Make API call to ZenoPay
        const ZENO_API_URL = 'https://zenoapi.com/api/payments/mobile_money_tanzania';
        const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';
        
        const response = await fetch(ZENO_API_URL, {
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
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
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
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
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
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Maelekezo ya malipo yamepelekwa kwenye simu yako. Tafadhali fuata maelekezo ili kukamilisha malipo.',
                    phoneNumber: cleanNumber,
                    amount: 500,
                    orderId: orderId
                })
            };
        } else {
            console.error('Payment request failed:', result);
            return {
                statusCode: response.status >= 400 ? response.status : 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
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
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Tatizo limetokea wakati wa kuunganisha na seva ya malipo. Tafadhali jaribu tena baadaye.',
                error: error.message
            })
        };
    }
};
