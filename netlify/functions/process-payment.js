// Netlify Function for processing payments
exports.handler = async (event, context) => {
    console.log('Process payment function called');
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));
    
    // Use dynamic import for node-fetch
    const { default: fetch } = await import('node-fetch');
    
    // ZenoPay API configuration
    const ZENO_API_URL = 'https://zenoapi.com/api/payments/mobile_money_tanzania';
    const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';
    
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
        
        // Make API call to ZenoPay with retries and timeout
        const attemptPayment = async () => {
            const controller = new AbortController();
            const timeoutMs = 8000;
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const resp = await fetch(ZENO_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': ZENO_API_KEY
                    },
                    body: JSON.stringify(paymentData),
                    signal: controller.signal
                });
                clearTimeout(timeout);
                const text = await resp.text();
                console.log('ZenoPay API response status:', resp.status);
                console.log('ZenoPay API response headers:', [...resp.headers.entries()]);
                console.log('ZenoPay API response text:', text);
                return { resp, text };
            } catch (e) {
                clearTimeout(timeout);
                console.error('ZenoPay fetch error:', e.message);
                throw e;
            }
        };

        let response, responseText;
        let attempts = 0;
        while (attempts < 3) {
            attempts++;
            try {
                const r = await attemptPayment();
                response = r.resp;
                responseText = r.text || '';
                break;
            } catch (err) {
                console.warn(`Payment attempt ${attempts} failed`);
                if (attempts >= 3) {
                    // Fall through to graceful processing response
                    console.warn('All payment attempts failed, returning processing state to UI');
                } else {
                    await new Promise(res => setTimeout(res, 1000));
                }
            }
        }

        // If we have no response or got a 504/non-JSON, still return processing so UI can poll
        if (!response || response.status === 504 || !(responseText || '').trim().match(/^\s*[\[{]/)) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kuchakata ombi lako la malipo. Tafadhali subiri na angalia hali mara kwa mara.',
                    phoneNumber: cleanNumber,
                    amount: 500,
                    orderId: orderId
                })
            };
        }

        // Try to parse JSON
        let result;
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            // Gracefully degrade to processing
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'Tunaendelea kuchakata ombi lako la malipo. Tafadhali subiri na angalia hali mara kwa mara.',
                    phoneNumber: cleanNumber,
                    amount: 500,
                    orderId: orderId
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
                message: 'Tatizo limetokea wakati wa kuunganisha na seva ya malipo. Tafadhali jaribu tena baadaye.'
            })
        };
    }
};