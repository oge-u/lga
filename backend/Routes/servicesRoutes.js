// servicesRoutes.js or in your adminRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const adminAuthMiddleware = require('../middleware/adminAuth');
const pool = require('../config/db'); // Your MySQL connection pool


// GET service price by service id
router.get('/:id/price', async (req, res) => {
    console.log('Price endpoint hit with id:', req.params.id); // Debug log
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        'SELECT service_price FROM services WHERE id = ?',
        [id]
      );
      if (rows.length > 0) {
        res.status(200).json({ price: rows[0].service_price });
      } else {
        res.status(404).json({ message: 'Service not found' });
      }
    } catch (error) {
      console.error('Error fetching service price:', error);
      res.status(500).json({ message: 'Error fetching service price' });
    }
  });
  

  // GET all services
router.get('/services', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, service_name, service_price, description, created_at, updated_at FROM services'
    );
    res.status(200).json({ services: rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
});


// PATCH update a service price
router.patch('/services/:id/price', adminAuthMiddleware, async (req, res) => {
  const serviceId = req.params.id;
  const { service_price } = req.body;
  if (service_price === undefined || isNaN(service_price)) {
    return res.status(400).json({ message: 'A valid service price is required.' });
  }
  try {
    const [result] = await pool.execute(
      'UPDATE services SET service_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [service_price, serviceId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Service price updated successfully' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error('Error updating service price:', error);
    res.status(500).json({ message: 'Failed to update service price', error: error.message });
  }
});

module.exports = router;
