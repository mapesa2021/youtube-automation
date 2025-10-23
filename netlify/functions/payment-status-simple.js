// Simplified and robust payment status function
exports.handler = async (event, context) => {
    console.log('Payment status check called');
    
    // Use dynamic import for node-fetch
    const { default: fetch } = await import('node-fetch');
    
    const ZENO_ORDER_STATUS_URL = 'https://zenoapi.com/api/payments/order-status';
    const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';
    
    // Handle CORS
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
    
    if (event.httpMethod !== 'GET') {
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
        const orderId = event.queryStringParameters?.orderId;
        console.log('Order ID:', orderId);
        
        if (!orderId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Order ID required'
                })
            };
        }
        
        // Simple timeout wrapper
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 10000);
        });
        
        const fetchPromise = fetch(`${ZENO_ORDER_STATUS_URL}?order_id=${orderId}`, {
            method: 'GET',
            headers: {
                'x-api-key': ZENO_API_KEY
            }
        });
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Always return processing if we can't parse or get errors
        if (!response.ok || !responseText.trim().startsWith('{')) {
            console.log('Returning processing due to API issues');
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kusubiri uthibitisho wa malipo.'
                })
            };
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed data:', data);
        } catch (e) {
            console.log('Parse error, returning processing');
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kusubiri uthibitisho wa malipo.'
                })
            };
        }
        
        // Check for completed payment
        if (data.result === 'SUCCESS' && data.data && data.data.length > 0) {
            const payment = data.data[0];
            console.log('Payment status:', payment.payment_status);
            
            if (payment.payment_status === 'COMPLETED') {
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: true,
                        status: 'completed',
                        message: 'Malipo yamekamilika kwa mafanikio!',
                        reference: payment.reference || payment.transid,
                        transactionId: payment.transid
                    })
                };
            } else if (payment.payment_status === 'FAILED') {
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        status: 'failed',
                        message: 'Malipo yameshindwa.'
                    })
                };
            }
        }
        
        // Default to processing
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                status: 'processing',
                message: 'Tafadhali kamilisha malipo kupitia USSD.'
            })
        };
        
    } catch (error) {
        console.error('Status check error:', error.message);
        
        // Always return processing on any error to avoid 502s
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                status: 'processing',
                message: 'Tunaendelea kusubiri uthibitisho wa malipo.',
                error: error.message
            })
        };
    }
};
