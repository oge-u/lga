// backend/app.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./Routes/userRoutes'); 
const adminRoutes = require('./Routes/adminRoutes'); 
const applicationRoutes = require('./Routes/applicationRoutes'); 
const servicesRoutes = require('./Routes/servicesRoutes')
const paymentRoutes = require('./Routes/paymentsRoutes')


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/users', userRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/applications', applicationRoutes); 
app.use('/api/services', servicesRoutes)
app.use('/api/payments', paymentRoutes)


app.get('/', (req, res) => {
    res.send('Welcome to the E-Services API!');
});

module.exports = app;