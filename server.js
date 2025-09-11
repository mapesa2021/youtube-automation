const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for payment status (in production, use a database)
const paymentStatuses = new Map();

// Zeno API configuration
const ZENO_API_URL = 'https://zenoapi.com/api/payments/mobile_money_tanzania';
const ZENO_API_KEY = 'ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g';

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
        const orderId = 'yt_auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Store initial payment status
        paymentStatuses.set(orderId, {
            status: 'PENDING',
            phoneNumber: cleanNumber,
            amount: 25000,
            createdAt: new Date().toISOString()
        });

        // Prepare payment data for Zeno API
        const paymentData = {
            order_id: orderId,
            buyer_email: "student@youtubeautomation.com",
            buyer_name: "YouTube Automation Student",
            buyer_phone: cleanNumber,
            amount: 25000, // Tshs 25,000
            webhook_url: `http://localhost:${PORT}/api/payment-webhook`
        };
        
        console.log('Processing payment for:', cleanNumber);
        console.log('Order ID:', orderId);
        
        // Make API call to Zeno
        const response = await fetch(ZENO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ZENO_API_KEY
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        
        // Check if Zeno API call was successful
        if (response.ok && result.status === 'success' && result.resultcode === '000') {
            console.log('Payment request sent successfully:', result);
            res.json({
                success: true,
                status: 'processing',
                message: 'Maelekezo ya malipo yamepelekwa kwenye simu yako. Tafadhali fuata maelekezo ili kukamilisha malipo.',
                orderId: orderId,
                phoneNumber: cleanNumber,
                amount: 25000,
                zenoResponse: result
            });
        } else {
            console.error('Payment request failed:', result);
            res.status(400).json({
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

// Webhook endpoint for Zeno payment status updates
app.post('/api/payment-webhook', (req, res) => {
    try {
        const { order_id, payment_status, transid, reference, channel, msisdn } = req.body;
        
        console.log('Webhook received:', req.body);
        
        if (paymentStatuses.has(order_id)) {
            const paymentData = paymentStatuses.get(order_id);
            paymentData.status = payment_status;
            paymentData.transid = transid;
            paymentData.reference = reference;
            paymentData.channel = channel;
            paymentData.msisdn = msisdn;
            paymentData.updatedAt = new Date().toISOString();
            
            paymentStatuses.set(order_id, paymentData);
            
            console.log(`Payment ${order_id} status updated to: ${payment_status}`);
        }
        
        res.json({ status: 'OK', message: 'Webhook received' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ status: 'ERROR', message: 'Webhook processing failed' });
    }
});

// Check payment status endpoint
app.get('/api/payment-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Check our local status first
        const localStatus = paymentStatuses.get(orderId);
        if (!localStatus) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // If still pending, check with Zeno API
        if (localStatus.status === 'PENDING') {
            try {
                const zenoResponse = await fetch(`https://zenoapi.com/api/payments/order-status?order_id=${orderId}`, {
                    method: 'GET',
                    headers: {
                        'x-api-key': ZENO_API_KEY
                    }
                });
                
                const zenoResult = await zenoResponse.json();
                
                if (zenoResult.result === 'SUCCESS' && zenoResult.data && zenoResult.data.length > 0) {
                    const paymentData = zenoResult.data[0];
                    localStatus.status = paymentData.payment_status;
                    localStatus.transid = paymentData.transid;
                    localStatus.reference = paymentData.reference;
                    localStatus.channel = paymentData.channel;
                    localStatus.updatedAt = new Date().toISOString();
                    
                    paymentStatuses.set(orderId, localStatus);
                }
            } catch (error) {
                console.error('Error checking Zeno status:', error);
            }
        }
        
        res.json({
            success: true,
            orderId: orderId,
            status: localStatus.status,
            phoneNumber: localStatus.phoneNumber,
            amount: localStatus.amount,
            createdAt: localStatus.createdAt,
            updatedAt: localStatus.updatedAt
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking payment status'
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
});

module.exports = app;
