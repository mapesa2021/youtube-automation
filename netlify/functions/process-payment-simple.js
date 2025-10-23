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
        
        // For now, just return success without calling ZenoPay API
        // This will help us test if the function structure works
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                status: 'processing',
                message: 'Test payment request received successfully!',
                phoneNumber: cleanNumber,
                amount: 5000,
                orderId: orderId
            })
        };
        
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
