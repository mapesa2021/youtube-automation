// Netlify Function for checking payment status
const { default: nodeFetch } = require('node-fetch');

// ZenoPay API configuration
const ZENO_ORDER_STATUS_URL = 'https://zenoapi.com/api/payments/order-status';
const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';

// In-memory storage for payment status (in production, use a database)
// Note: This will reset when the function cold starts
const paymentStatuses = new Map();

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({
                success: false,
                message: 'Method not allowed'
            })
        };
    }

    try {
        const orderId = event.queryStringParameters?.orderId || event.path.split('/').pop();
        
        if (!orderId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: 'Order ID is required'
                })
            };
        }
        
        // Initialize payment status if not exists (for this function instance)
        if (!paymentStatuses.has(orderId)) {
            paymentStatuses.set(orderId, {
                status: 'processing',
                createdAt: new Date()
            });
        }
        
        const storedStatus = paymentStatuses.get(orderId);
        
        // Retry mechanism for checking with ZenoPay API
        let statusResponse, statusText;
        let retries = 3;
        
        while (retries > 0) {
            try {
                statusResponse = await nodeFetch(`${ZENO_ORDER_STATUS_URL}?order_id=${orderId}`, {
                    method: 'GET',
                    headers: {
                        'x-api-key': ZENO_API_KEY
                    }
                });
                
                statusText = await statusResponse.text();
                console.log('ZenoPay Order Status API response:', statusText);
                
                // If we get a valid response, break out of retry loop
                if (statusText.startsWith('{') || statusText.startsWith('[')) {
                    break;
                }
            } catch (fetchError) {
                console.error(`Error fetching status (attempt ${4 - retries}):`, fetchError);
            }
            
            retries--;
            // Wait 1 second before retrying
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // If all retries failed or we still have non-JSON response
        if (!statusText || (!statusText.startsWith('{') && !statusText.startsWith('['))) {
            console.error('Received non-JSON response from ZenoPay Order Status API after retries:', statusText);
            // Instead of failing, we'll continue to show processing status
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kusubiri uthibitisho wa malipo. Tafadhali subiri kidogo na ujaribu tena.'
                })
            };
        }
        
        let statusResult;
        try {
            statusResult = statusText ? JSON.parse(statusText) : {};
        } catch (parseError) {
            console.error('Failed to parse JSON status response:', parseError);
            // Instead of failing, we'll continue to show processing status
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kusubiri uthibitisho wa malipo. Tafadhali subiri kidogo na ujaribu tena.'
                })
            };
        }
        
        // Check if the payment is completed
        if (statusResponse.ok && statusResult.result === 'SUCCESS' && statusResult.data && statusResult.data.length > 0) {
            const paymentData = statusResult.data[0];
            if (paymentData.payment_status === 'COMPLETED') {
                // Update status to completed
                paymentStatuses.set(orderId, {
                    ...storedStatus,
                    status: 'completed',
                    completedAt: new Date(),
                    reference: paymentData.reference,
                    transactionId: paymentData.transid
                });
                
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: true,
                        status: 'completed',
                        message: 'Malipo yamekamilika kwa mafanikio!',
                        reference: paymentData.reference,
                        transactionId: paymentData.transid
                    })
                };
            } else if (paymentData.payment_status === 'FAILED') {
                // Update status to failed
                paymentStatuses.set(orderId, {
                    ...storedStatus,
                    status: 'failed',
                    failedAt: new Date(),
                    errorMessage: 'Malipo yameshindwa.'
                });
                
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: false,
                        status: 'failed',
                        message: 'Malipo yameshindwa. Tafadhali jaribu tena.'
                    })
                };
            }
        }
        
        // If not completed or failed, still processing
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                status: 'processing',
                message: 'Tafadhali kamilisha malipo kupitia USSD uliyopewa.'
            })
        };
        
    } catch (error) {
        console.error('Payment status check error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                status: 'processing',
                message: 'Tatizo limetokea wakati wa kuangalia hali ya malipo. Tunajaribu tena kwa ajili yako.'
            })
        };
    }
};