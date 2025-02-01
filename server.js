const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: 'rzp_live_zH5VVk1UUtT9CV',
    key_secret: 'PQ4csvtr2uOxBCROtWtrQ9AT'
});

// Serve static files
app.use(express.static(__dirname));

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // amount in paisa
            currency: 'INR',
            receipt: 'order_' + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify payment endpoint
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const generated_signature = crypto
            .createHmac('sha256', 'PQ4csvtr2uOxBCROtWtrQ9AT')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this at the top of server.js
let walletBalance = 5000; // Initial balance of ₹5,000

// Modify your verify-payment endpoint
app.post('/api/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', 'YOUR_SECRET_KEY')
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSignature) {
            // Update wallet balance
            walletBalance += parseInt(amount);
            
            res.json({
                success: true,
                message: 'Payment verified successfully',
                newBalance: walletBalance
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Add an endpoint to get current balance
app.get('/api/balance', (req, res) => {
    res.json({ balance: walletBalance });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
