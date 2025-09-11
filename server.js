const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
        
        // Prepare payment data for Zeno API
        const paymentData = {
            order_id: orderId,
            buyer_email: "student@youtubeautomation.com",
            buyer_name: "YouTube Automation Student",
            buyer_phone: cleanNumber,
            amount: 25000 // Tshs 25,000
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
        
        if (response.ok && result.success) {
            console.log('Payment initiated successfully:', result);
            res.json({
                success: true,
                message: 'Malipo yamepokelewa kwa mafanikio!',
                orderId: orderId,
                phoneNumber: cleanNumber,
                amount: 25000,
                zenoResponse: result
            });
        } else {
            console.error('Payment failed:', result);
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
