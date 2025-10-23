// Test function to check ZenoPay status API directly
exports.handler = async (event, context) => {
    console.log('Test payment status function called');
    
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: ''
        };
    }
    
    try {
        // Get order ID from query parameters
        const orderId = event.queryStringParameters?.orderId;
        
        if (!orderId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Order ID is required'
                })
            };
        }
        
        console.log('Testing payment status for order ID:', orderId);
        
        // Test ZenoPay status API
        const ZENO_ORDER_STATUS_URL = 'https://zenoapi.com/api/payments/order-status';
        const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';
        
        const url = `${ZENO_ORDER_STATUS_URL}?order_id=${orderId}`;
        console.log(`Testing status API: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': ZENO_API_KEY
            }
        });
        
        console.log('Status API response status:', response.status);
        
        const responseText = await response.text();
        console.log('Status API response text:', responseText);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                orderId: orderId,
                apiStatus: response.status,
                apiResponse: responseText,
                parsedResponse: responseText.startsWith('{') ? JSON.parse(responseText) : null
            })
        };
        
    } catch (error) {
        console.error('Test status error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Test failed',
                error: error.message
            })
        };
    }
};

