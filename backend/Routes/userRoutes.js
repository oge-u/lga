const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db'); 
const multer  = require('multer'); // Import multer
const path = require('path');

const router = express.Router();

// Function to generate a unique 8-digit PID
async function generateUniquePID() {
    let pid;
    let isUnique = false;
    const connection = await pool.getConnection();

    while (!isUnique) {
        pid = Math.floor(10000000 + Math.random() * 90000000).toString(); // Generate 8-digit number as string
        const [rows] = await connection.execute(
            'SELECT pid FROM users WHERE pid = ?',
            [pid]
        );
        if (rows.length === 0) {
            isUnique = true;
        }
    }
    connection.release();
    return pid;
}


// Multer configuration for profile picture upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/profile-pictures/'); // Destination folder for uploads
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage }); // Create multer instance


// Registration Endpoint
router.post('/register', async (req, res) => {
    try {
        const {
            firstName, lastName, otherNames, phoneNumber, emailAddress, nationality, homeAddress,
            state, city, lga, identificationType, identificationNumber, employmentStatus, password
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const pid = await generateUniquePID(); // Generate PID here

        const connection = await pool.getConnection();

        const query = `
            INSERT INTO users (
                first_name, last_name, other_names, phone_number, email_address, nationality, home_address,
                state, city, lga, pid, identification_type, identification_number, employment_status, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            firstName, lastName, otherNames, phoneNumber, emailAddress, nationality, homeAddress,
            state, city, lga, pid, identificationType, identificationNumber, employmentStatus, hashedPassword
        ];

        await connection.execute(query, values);
        connection.release();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email address already registered' });
        }
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login Endpoint (No changes needed here)
router.post('/login', async (req, res) => {
    // ... (Login logic - remains the same) ...
    try {
        const { emailAddress, password } = req.body;

        const connection = await pool.getConnection();

        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email_address = ?',
            [emailAddress]
        );
        connection.release();

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userForClient = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            emailAddress: user.email_address,
        };

        res.status(200).json({ message: 'Login successful', user: userForClient });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Get User Data Endpoint (No changes needed here)
router.get('/user/:email', async (req, res) => {
    // ... (Get User Data logic - remains the same) ...
    try {
        const emailAddress = req.params.email;

        const connection = await pool.getConnection();

        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email_address = ?',
            [emailAddress]
        );
        connection.release();

        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userForClient = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            otherNames: user.other_names,
            phoneNumber: user.phone_number,
            emailAddress: user.email_address,
            nationality: user.nationality,
            homeAddress: user.home_address,
            state: user.state,
            city: user.city,
            lga: user.lga,
            pid: user.pid,
            identificationType: user.identification_type,
            identificationNumber: user.identification_number,
            employmentStatus: user.employment_status,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };

        res.status(200).json({ user: userForClient });

    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ message: 'Failed to get user data', error: error.message });
    }
});


// Profile Picture Upload Endpoint (Revised Path Construction)
router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
    try {
      const emailAddress = req.body.emailAddress;

      // Directly construct profilePicturePath relative to 'uploads/profile-pictures'
      const profilePicturePath = `uploads/profile-pictures/${req.file.filename}`;
      console.log('Backend - Constructed profilePicturePath (direct):', profilePicturePath); // Log direct path

      // Construct absolute URL - Use your backend server's base URL here
      const backendBaseUrl = 'http://localhost:5000';
      const profilePictureUrl = `${backendBaseUrl}/${profilePicturePath}`; // Use direct path in URL
      console.log('Backend - backendBaseUrl:', backendBaseUrl);
      console.log('Backend - Constructed profilePictureUrl:', profilePictureUrl);

      res.status(200).json({ message: 'Profile picture uploaded successfully', profilePictureUrl: profilePictureUrl });

    } catch (error) { /* ... */ }
});


module.exports = router;