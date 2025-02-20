// paymentsRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const adminAuthMiddleware = require('../middleware/adminAuth');
const cors = require('cors');
const axios = require('axios'); 



// Create a payment record
router.post('/payments', async (req, res) => {
  try {
    const { registrationId, service_id, user_id, payment_amount, payment_method, transaction_reference } = req.body;
    // Insert a new payment record (payment_status defaults to 'pending')
    const [result] = await pool.execute(
      `INSERT INTO payments (service_id, user_id, registration_id, payment_amount, payment_method, transaction_reference, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [service_id, user_id, registrationId, payment_amount, payment_method, transaction_reference]
    );
    if (result.insertId) {
      // Optionally, update the registration status to "awaiting admin approval"
      await pool.execute(
        "UPDATE death_certificate_applications SET status = 'awaiting admin approval' WHERE id = ?",
        [registrationId]
      );
      res.status(201).json({ message: 'Payment record created successfully', paymentId: result.insertId });
    } else {
      res.status(400).json({ message: 'Failed to create payment record' });
    }
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(500).json({ message: 'Error creating payment record', error: error.message });
  }
});

// (Optional) Update payment status (admin endpoint)
router.patch('/payments/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { payment_status } = req.body;
    const allowedStatuses = ['pending', 'awaiting admin approval', 'approved', 'rejected', 'failed'];
    if (!allowedStatuses.includes(payment_status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    const [result] = await pool.execute(
      `UPDATE payments SET payment_status = ? WHERE id = ?`,
      [payment_status, paymentId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Payment status updated successfully' });
    } else {
      res.status(404).json({ message: 'Payment record not found' });
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Get payment details by id
router.get('/payments/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE id = ?`,
      [paymentId]
    );
    if (rows.length > 0) {
      res.status(200).json({ payment: rows[0] });
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Error fetching payment details', error: error.message });
  }
});


const paystackSecretKey = 'YOUR_PAYSTACK_SECRET_KEY'; // Replace with your Paystack Secret Key

router.post('/api/verify-payment', async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ status: 'error', message: 'Payment reference is required' });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.paystack.co/transaction/verify/${reference}`,
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`, // Use your secret key here
      },
    });

    if (response.data.status && response.data.data.status === 'success') {
      // Payment verification successful from Paystack API
      console.log('Paystack verification successful:', response.data.data);
      // **IMPORTANT:** Here you should also check:
      // 1. The amount paid matches the expected servicePrice.
      // 2. The currency is correct.
      // 3. The transaction reference is unique in your system (prevent duplicate processing).
      // 4. Update your database to mark the registration as paid based on metadata.registration_id (if you sent it).

      return res.json({ status: 'success', message: 'Payment verified', data: response.data.data });
    } else {
      // Payment verification failed from Paystack API
      console.error('Paystack verification failed:', response.data);
      return res.status(400).json({ status: 'error', message: 'Payment verification failed', paystackData: response.data });
    }
  } catch (error) {
    console.error('Error verifying payment with Paystack API:', error);
    return res.status(500).json({ status: 'error', message: 'Error verifying payment', error: error.message });
  }
});



module.exports = router;
