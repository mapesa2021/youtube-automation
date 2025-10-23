// Netlify Function for checking payment status - Recreated from scratch
const { default: fetch } = require('node-fetch');

// ZenoPay API configuration
const ZENO_ORDER_STATUS_URL = 'https://zenoapi.com/api/payments/order-status';
const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';

exports.handler = async (event, context) => {
    console.log('Payment status check function called');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight requests
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
        // Extract order ID from query parameters
        const orderId = event.queryStringParameters?.orderId;
        
        console.log('Checking payment status for order ID:', orderId);
        
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
        
        // Call ZenoPay status API
        const statusUrl = `${ZENO_ORDER_STATUS_URL}?order_id=${orderId}`;
        console.log('Calling ZenoPay status API:', statusUrl);
        
        const response = await fetch(statusUrl, {
            method: 'GET',
            headers: {
                'x-api-key': ZENO_API_KEY
            }
        });
        
        console.log('ZenoPay status API response status:', response.status);
        
        const responseText = await response.text();
        console.log('ZenoPay status API response text:', responseText);
        
        // Parse the response
        let statusData;
        try {
            statusData = JSON.parse(responseText);
            console.log('Parsed status data:', statusData);
        } catch (parseError) {
            console.error('Failed to parse status response:', parseError);
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kusubiri uthibitisho wa malipo. Tafadhali subiri kidogo na ujaribu tena.',
                    debug: 'Failed to parse response'
                })
            };
        }
        
        // Check payment status based on ZenoPay response format
        if (response.ok && statusData) {
            // Check if payment is completed
            if (statusData.result === 'SUCCESS' && statusData.data && statusData.data.length > 0) {
                const paymentInfo = statusData.data[0];
                console.log('Payment info:', paymentInfo);
                
                if (paymentInfo.payment_status === 'COMPLETED') {
                    console.log('Payment completed successfully!');
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
                            reference: paymentInfo.reference || paymentInfo.transid,
                            transactionId: paymentInfo.transid,
                            amount: paymentInfo.amount,
                            phoneNumber: paymentInfo.buyer_phone
                        })
                    };
                } else if (paymentInfo.payment_status === 'FAILED') {
                    console.log('Payment failed');
                    return {
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            success: false,
                            status: 'failed',
                            message: 'Malipo yameshindwa. Tafadhali jaribu tena.'
                        })
                    };
                } else {
                    console.log('Payment still processing:', paymentInfo.payment_status);
                    return {
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            success: true,
                            status: 'processing',
                            message: 'Tafadhali kamilisha malipo kupitia USSD uliyopewa.',
                            currentStatus: paymentInfo.payment_status
                        })
                    };
                }
            } else if (statusData.result === 'FAILED') {
                console.log('Payment failed:', statusData.message);
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: false,
                        status: 'failed',
                        message: statusData.message || 'Malipo yameshindwa. Tafadhali jaribu tena.'
                    })
                };
            } else {
                console.log('Payment still processing or unknown status');
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        success: true,
                        status: 'processing',
                        message: 'Tafadhali kamilisha malipo kupitia USSD uliyopewa.',
                        debug: 'Unknown status format'
                    })
                };
            }
        } else {
            console.log('API call failed or returned error');
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kusubiri uthibitisho wa malipo. Tafadhali subiri kidogo na ujaribu tena.',
                    debug: 'API call failed'
                })
            };
        }
        
    } catch (error) {
        console.error('Payment status check error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                status: 'processing',
                message: 'Tatizo limetokea wakati wa kuangalia hali ya malipo. Tunajaribu tena kwa ajili yako.',
                error: error.message
            })
        };
    }
};
