const express = require('express');
const cors = require('cors');
const { default: nodeFetch } = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// In-memory storage for payment status (in production, use a database)
const paymentStatuses = new Map();

// ZenoPay API configuration
const ZENO_API_URL = 'https://zenoapi.com/api/payments/mobile_money_tanzania';
const ZENO_ORDER_STATUS_URL = 'https://zenoapi.com/api/payments/order-status';
const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g'; // Your actual API key

// Payment endpoint
app.post('/api/process-payment', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        // Validate phone number
        if (!phoneNumber || phoneNumber.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nambari ya simu ni lazima'
            });
        }
        
        // Clean phone number
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        if (cleanNumber.length < 9 || cleanNumber.length > 13) {
            return res.status(400).json({
                success: false,
                message: 'Nambari ya simu si sahihi'
            });
        }
        
        // Generate unique order ID
        const orderId = `yt_auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store initial payment status as processing
        paymentStatuses.set(orderId, {
            status: 'processing',
            phoneNumber: cleanNumber,
            amount: 5000,
            createdAt: new Date()
        });
        
        // Prepare payment data for ZenoPay API (using your confirmed format)
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
        console.log('ZenoPay API response headers:', [...response.headers.entries()]);
        
        // Get the raw response text first for debugging
        const responseText = await response.text();
        console.log('ZenoPay API response text:', responseText);
        
        // Try to parse JSON, but handle if it's not valid JSON
        let result;
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Response text was:', responseText);
            return res.status(500).json({
                success: false,
                message: 'Tatizo limetokea katika mchakato wa malipo. Tafadhali jaribu tena.'
            });
        }
        
        // Check if ZenoPay API call was successful
        if (response.ok && result.status === 'success') {
            console.log('Payment request sent successfully:', result);
            res.json({
                success: true,
                status: 'processing',
                message: 'Maelekezo ya malipo yamepelekwa kwenye simu yako. Tafadhali fuata maelekezo ili kukamilisha malipo.',
                phoneNumber: cleanNumber,
                amount: 5000,
                orderId: orderId
            });
        } else {
            console.error('Payment request failed:', result);
            // Update status to failed
            paymentStatuses.set(orderId, {
                ...paymentStatuses.get(orderId),
                status: 'failed',
                errorMessage: result.message || 'Malipo yameshindwa. Tafadhali jaribu tena.'
            });
            res.status(response.status >= 400 ? response.status : 400).json({
                success: false,
                message: result.message || 'Malipo yameshindwa. Tafadhali jaribu tena.'
            });
        }
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Kuna tatizo la mtandao. Tafadhali jaribu tena baadaye.'
        });
    }
});

// Payment status check endpoint
app.get('/api/payment-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // First check in-memory storage
        const storedStatus = paymentStatuses.get(orderId);
        if (!storedStatus) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // If already completed or failed, return stored status
        if (storedStatus.status === 'completed' || storedStatus.status === 'failed') {
            return res.json({
                success: storedStatus.status === 'completed',
                status: storedStatus.status,
                message: storedStatus.message || (storedStatus.status === 'completed' 
                    ? 'Malipo yamekamilika kwa mafanikio!' 
                    : 'Malipo yameshindwa.'),
                phoneNumber: storedStatus.phoneNumber,
                amount: storedStatus.amount
            });
        }
        
        // Check with ZenoPay API for the latest status
        const statusResponse = await nodeFetch(`${ZENO_ORDER_STATUS_URL}?order_id=${orderId}`, {
            method: 'GET',
            headers: {
                'x-api-key': ZENO_API_KEY
            }
        });
        
        const statusText = await statusResponse.text();
        console.log('ZenoPay Order Status API response:', statusText);
        
        // Handle non-JSON responses (like 504 errors)
        if (!statusText.startsWith('{') && !statusText.startsWith('[')) {
            console.error('Received non-JSON response from ZenoPay Order Status API:', statusText);
            return res.status(500).json({
                success: false,
                status: 'processing',
                message: 'Tafadhali subiri kidogo, tunakagua hali ya malipo yako.'
            });
        }
        
        let statusResult;
        try {
            statusResult = statusText ? JSON.parse(statusText) : {};
        } catch (parseError) {
            console.error('Failed to parse JSON status response:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Tatizo limetokea katika kuangalia hali ya malipo.'
            });
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
                
                return res.json({
                    success: true,
                    status: 'completed',
                    message: 'Malipo yamekamilika kwa mafanikio!',
                    phoneNumber: storedStatus.phoneNumber,
                    amount: storedStatus.amount,
                    reference: paymentData.reference,
                    transactionId: paymentData.transid
                });
            } else if (paymentData.payment_status === 'FAILED') {
                // Update status to failed
                paymentStatuses.set(orderId, {
                    ...storedStatus,
                    status: 'failed',
                    failedAt: new Date(),
                    errorMessage: 'Malipo yameshindwa.'
                });
                
                return res.json({
                    success: false,
                    status: 'failed',
                    message: 'Malipo yameshindwa. Tafadhali jaribu tena.',
                    phoneNumber: storedStatus.phoneNumber,
                    amount: storedStatus.amount
                });
            }
        }
        
        // If not completed or failed, still processing
        res.json({
            success: true,
            status: 'processing',
            message: 'Tafadhali kamilisha malipo kupitia USSD uliyopewa.',
            phoneNumber: storedStatus.phoneNumber,
            amount: storedStatus.amount
        });
        
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            status: 'processing',
            message: 'Tatizo limetokea. Tunaendelea kusubiri malipo yako.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'YouTube Automation Payment API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Payment API server running on port ${PORT}`);
    console.log(`📱 Ready to process YouTube Automation payments`);
    console.log(`🔑 ZenoPay API Key: ${ZENO_API_KEY.substring(0, 5)}...${ZENO_API_KEY.substring(ZENO_API_KEY.length - 5)}`);
});

module.exports = app;