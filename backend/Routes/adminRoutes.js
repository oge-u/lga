const express = require('express');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const adminAuthMiddleware = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const router = express.Router();


// Admin Registration Endpoint (UPDATED - Single Super Admin Enforcement)
router.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('adminRole').optional().isIn(['superadmin', 'admin', 'clusteradmin', 'bursaryadmin']).withMessage('Invalid admin role'), // Admin role is now optional in request
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    try {
        const { username, password, adminRole } = req.body;
        const requestedRole = adminRole || 'admin'; // Default to 'admin' role if not specified

        const connection = await pool.getConnection();

        // Check if username already exists (prevent duplicate usernames)
        const [existingAdminRows] = await connection.execute(
            'SELECT username FROM admins WHERE username = ?',
            [username]
        );
        if (existingAdminRows.length > 0) {
            connection.release();
            return res.status(409).json({ message: 'Username already exists' }); // 409 Conflict for existing username
        }

        // Enforce single Super Admin rule
        if (requestedRole === 'superadmin') {
            const [superAdminCountRows] = await connection.execute(
                'SELECT COUNT(*) AS count FROM admins WHERE admin_role = ?',
                ['superadmin']
            );
            const superAdminCount = superAdminCountRows[0].count;
            if (superAdminCount >= 1) {
                connection.release();
                return res.status(403).json({ message: 'Super Admin role already exists. Only one Super Admin allowed.' }); // 403 Forbidden - Super Admin exists
            }
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO admins (username, password_hash, admin_role)
            VALUES (?, ?, ?)
        `;
        const values = [
            username, hashedPassword, requestedRole
        ];

        await connection.execute(query, values);
        connection.release();

        res.status(201).json({ message: 'Admin user registered successfully' }); // 201 Created for successful registration

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Admin registration failed', error: error.message }); // 500 Internal Server Error
    }
});



router.put('/clusters/assign', adminAuthMiddleware, async (req, res) => {
  try {
    const { admin_id, cluster_ids } = req.body;
    if (!admin_id || !Array.isArray(cluster_ids)) {
      return res.status(400).json({ message: 'admin_id and cluster_ids are required' });
    }
    
    const connection = await pool.getConnection();

    // Clear previous assignments for this admin that are not in the new list:
    if (cluster_ids.length > 0) {
      const placeholders = cluster_ids.map(() => '?').join(',');
      await connection.execute(
        `UPDATE clusters SET admin_id = NULL WHERE admin_id = ? AND id NOT IN (${placeholders})`,
        [admin_id, ...cluster_ids]
      );
      // Assign all clusters in the new list to the given admin (overwriting any existing assignment)
      await connection.execute(
        `UPDATE clusters SET admin_id = ? WHERE id IN (${placeholders})`,
        [admin_id, ...cluster_ids]
      );
    } else {
      // If empty array provided, clear all clusters for this admin
      await connection.execute(
        `UPDATE clusters SET admin_id = NULL WHERE admin_id = ?`,
        [admin_id]
      );
    }
    
    connection.release();
    res.status(200).json({ message: 'Clusters assigned successfully' });
  } catch (error) {
    console.error('Error assigning clusters:', error);
    res.status(500).json({ message: 'Error assigning clusters', error: error.message });
  }
});


router.delete('/clusters/:id/assignment', adminAuthMiddleware, async (req, res) => {
  try {
    const clusterId = req.params.id;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE clusters SET admin_id = NULL WHERE id = ?',
      [clusterId]
    );
    connection.release();
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Cluster assignment removed successfully' });
    } else {
      res.status(404).json({ message: 'Cluster not found' });
    }
  } catch (error) {
    console.error('Error removing cluster assignment:', error);
    res.status(500).json({ message: 'Error removing cluster assignment', error: error.message });
  }
});



// Admin Login Endpoint (JWT Authentication)
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    try {
        const { username, password } = req.body;

        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );
        connection.release();

        const adminUser = rows[0];

        if (!adminUser) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Authentication successful - Generate JWT
        const payload = { // Payload (data to include in JWT)
            adminId: adminUser.id,
            adminRole: adminUser.admin_role,
            // You can add other relevant admin data to the payload
        };
        const secretKey = process.env.JWT_SECRET_KEY; // <--- **IMPORTANT: Replace with a strong, secret key!**
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Generate JWT, expires in 1 hour

        const adminForClient = { // Safe user object for client
            id: adminUser.id,
            username: adminUser.username,
            adminRole: adminUser.admin_role,
        };

        res.status(200).json({ message: 'Admin login successful', admin: adminForClient, token: token }); // Send back token in response

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Admin login failed', error: error.message });
    }
});



// Admin Login Endpoint (JWT Authentication - No changes needed here if already implemented)
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => { /* ... route handler code for login and JWT generation ... */ });


// Admin - View All Applications Endpoint (for Admin Dashboard) - PROTECTED WITH JWT AUTHENTICATION
router.get('/view-all-applications', adminAuthMiddleware, async (req, res) => { // <-- Applied adminAuthMiddleware
    try {
        // In a real app, you would have more sophisticated admin authorization checks based on req.admin.adminRole

        const connection = await pool.getConnection();

        // Fetch ALL applications from all tables (for admin view)
        const [deathCertApps] = await connection.execute('SELECT id, application_date, status FROM death_certificate_applications');
        const [localGovIdApps] = await connection.execute('SELECT id, application_date, status FROM local_government_id_applications');
        const [clubRegApps] = await connection.execute('SELECT id, application_date, status FROM club_association_registrations');
        const [wasteFeesApps] = await connection.execute('SELECT id, application_date, payment_status AS status FROM waste_management_fees_payments');
        const [streetRegApps] = await connection.execute('SELECT id, application_date,  status FROM street_registrations');
        const [businessRegApps] = await connection.execute('SELECT id, application_date, status FROM business_registrations');

        connection.release();

        // Combine all applications (similar to user's "View All Applications")
        const allApplications = [
            ...deathCertApps.map(app => ({ ...app, type: 'Death Certificate' })),
            ...localGovIdApps.map(app => ({ ...app, type: 'Local Government ID' })),
            ...clubRegApps.map(app => ({ ...app, type: 'Club/Association Registration' })),
            ...wasteFeesApps.map(app => ({ ...app, type: 'Waste Management Fees Payment' })),
            ...streetRegApps.map(app => ({ ...app, type: 'Street Registration' })),
            ...businessRegApps.map(app => ({ ...app, type: 'Business Registration' })),
        ];

        res.status(200).json({ applications: allApplications });

    } catch (error) {
        console.error('Admin - View All Applications error:', error);
        res.status(500).json({ message: 'Failed to fetch all applications for admin', error: error.message });
    }
});


router.get('/users/list', adminAuthMiddleware, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT a.id, a.username, a.admin_role, a.created_at,
         GROUP_CONCAT(c.id) as assignedClusters
       FROM admins a
       LEFT JOIN clusters c ON c.admin_id = a.id
       GROUP BY a.id`
    );
    connection.release();

    // Convert the comma-separated string to an array for each admin
    const adminUsers = rows.map(admin => {
      return {
        ...admin,
        assignedClusters: admin.assignedClusters ? admin.assignedClusters.split(',').map(Number) : []
      };
    });
    
    res.status(200).json({ adminUsers });
  } catch (error) {
    console.error('Admin - Get Admin Users list error:', error);
    res.status(500).json({ message: 'Failed to fetch admin users list', error: error.message });
  }
});



// Admin - Update Admin User Role Endpoint (NEW ENDPOINT - PROTECTED)
router.post('/users/:id/update-role', adminAuthMiddleware, [ // <-- Protected with adminAuthMiddleware
    body('newRole').notEmpty().isIn(['superadmin', 'admin', 'clusteradmin', 'bursaryadmin']).withMessage('New role must be valid'), // Validate newRole
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    const adminIdToUpdate = req.params.id; // Get admin ID from URL parameter
    const { newRole } = req.body; // Get newRole from request body

    if (!adminIdToUpdate || isNaN(adminIdToUpdate)) {
        return res.status(400).json({ message: 'Invalid admin user ID' });
    }

    try {
        const connection = await pool.getConnection();

        // Prevent Super Admins from demoting themselves (optional security check)
        if (req.admin.adminRole === 'superadmin' && req.admin.adminId === parseInt(adminIdToUpdate) && newRole === 'admin' && newRole === 'clusteradmin' && newRole === 'bursaryadmin') {
          connection.release();
          return res.status(403).json({ message: 'Super Admins cannot demote themselves.' }); // 403 Forbidden
        }


        const query = `
            UPDATE admins
            SET admin_role = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const values = [
            newRole, adminIdToUpdate
        ];

        await connection.execute(query, values);
        connection.release();

        res.status(200).json({ message: 'Admin role updated successfully' }); // 200 OK for successful update

    } catch (error) {
        console.error('Error updating admin role:', error);
        res.status(500).json({ message: 'Failed to update admin role', error: error.message }); // 500 Internal Server Error
    }
});


// Admin - Get Service List with Prices Endpoint (NEW ENDPOINT - PROTECTED)
router.get('/services/list', adminAuthMiddleware, async (req, res) => { // <-- Protected with adminAuthMiddleware
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id, service_name, service_price, description FROM services' // Select service info
        );
        connection.release();

        const servicesList = rows; // Rows is already an array of service objects

        res.status(200).json({ services: servicesList }); // Send back the list of services

    } catch (error) {
        console.error('Admin - Get Service List error:', error);
        res.status(500).json({ message: 'Failed to fetch service list', error: error.message });
    }
});


// Admin - Update Service Price Endpoint (NEW ENDPOINT - PROTECTED - SUPER ADMIN ONLY)
router.post('/services/:id/update-price', adminAuthMiddleware, [ // <-- Protected with adminAuthMiddleware
    body('servicePrice').isDecimal({ decimal_places: '2' }).toFloat().withMessage('Service price must be a valid decimal amount'), // Validate servicePrice
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    const serviceIdToUpdate = req.params.id; // Get service ID from URL parameter
    const { servicePrice } = req.body; // Get servicePrice from request body

    if (!serviceIdToUpdate || isNaN(serviceIdToUpdate)) {
        return res.status(400).json({ message: 'Invalid service ID' });
    }

    // In a real app, you would add authorization checks here to ensure only Super Admins can update prices
    if (req.admin.adminRole !== 'superadmin') { // Example: Only Super Admins can update prices
        return res.status(403).json({ message: 'Forbidden: Only Super Admins can update service prices.' }); // 403 Forbidden
    }


    try {
        const connection = await pool.getConnection();

        const query = `
            UPDATE services
            SET service_price = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const values = [
            servicePrice, serviceIdToUpdate
        ];

        await connection.execute(query, values);
        connection.release();

        res.status(200).json({ message: 'Service price updated successfully' }); // 200 OK for successful update

    } catch (error) {
        console.error('Error updating service price:', error);
        res.status(500).json({ message: 'Failed to update service price', error: error.message }); // 500 Internal Server Error
    }
});






// --- Revenue Calculation Functions ---

// Function to calculate Waste Management Fees Revenue
const calculateWasteManagementFeesRevenue = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT SUM(payment_amount) AS totalRevenue FROM waste_management_fees_payments WHERE payment_status = ?',
        ['completed'] // Only count completed payments for revenue
      );
      return rows[0].totalRevenue || 0; // Return total revenue or 0 if no revenue
    } finally {
      connection.release();
    }
  };
  
  // Function to calculate Death Certificate Revenue
  const calculateDeathCertificateRevenue = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS applicationCount FROM death_certificate_applications WHERE status = ?',
        ['completed'] // Assuming 'completed' status means revenue-generating applications
      );
      const applicationCount = rows[0].applicationCount || 0;
  
      // Fetch Death Certificate service price from services table
      const [servicePriceRows] = await connection.execute(
        'SELECT service_price FROM services WHERE service_name = ?',
        ['Death Certificate']
      );
      const servicePrice = servicePriceRows[0]?.service_price || 0; // Get price or default to 0
  
      return applicationCount * servicePrice; // Calculate total revenue
    } finally {
      connection.release();
    }
  };
  

// Function to calculate Local Government ID Revenue (NEW)
const calculateLocalGovIdRevenue = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS totalRevenue FROM local_government_id_applications WHERE status = ?',
        ['completed'] // Assuming 'completed' status means revenue-generating applications
      );
      const applicationCount = rows[0].totalRevenue || 0;
  
      // Fetch Local Government ID service price from services table
      const [servicePriceRows] = await connection.execute(
        'SELECT service_price FROM services WHERE service_name = ?',
        ['Local Government ID']
      );
      const servicePrice = servicePriceRows[0]?.service_price || 0;
  
      return applicationCount * servicePrice;
    } finally {
      connection.release();
    }
  };
  
  // Function to calculate Club/Association Registration Revenue (NEW)
  const calculateClubAssociationRegRevenue = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS totalRevenue FROM club_association_registrations WHERE status = ?',
        ['completed'] // Assuming 'completed' status means revenue-generating applications
      );
      const applicationCount = rows[0].totalRevenue || 0;
  
      // Fetch Club/Association Registration service price from services table
      const [servicePriceRows] = await connection.execute(
        'SELECT service_price FROM services WHERE service_name = ?',
        ['Club/Association Registration']
      );
      const servicePrice = servicePriceRows[0]?.service_price || 0;
  
      return applicationCount * servicePrice;
    } finally {
      connection.release();
    }
  };
  
  // Function to calculate Street Registration Revenue (NEW)
  const calculateStreetRegRevenue = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS totalRevenue FROM street_registrations WHERE status = ?',
        ['completed'] // Assuming 'completed' status means revenue-generating applications
      );
      const applicationCount = rows[0].totalRevenue || 0;
  
      // Fetch Street Registration service price from services table
      const [servicePriceRows] = await connection.execute(
        'SELECT service_price FROM services WHERE service_name = ?',
        ['Street Registration']
      );
      const servicePrice = servicePriceRows[0]?.service_price || 0;
  
      return applicationCount * servicePrice;
    } finally {
      connection.release();
    }
  };
  
  // Function to calculate Business Registration Revenue (NEW)
  const calculateBusinessRegRevenue = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS totalRevenue FROM business_registrations WHERE status = ?',
        ['completed'] // Assuming 'completed' status means revenue-generating applications
      );
      const applicationCount = rows[0].totalRevenue || 0;
  
      // Fetch Business Registration service price from services table
      const [servicePriceRows] = await connection.execute(
        'SELECT service_price FROM services WHERE service_name = ?',
        ['Business Registration']
      );
      const servicePrice = servicePriceRows[0]?.service_price || 0;
  
      return applicationCount * servicePrice;
    } finally {
      connection.release();
    }
  };
  
  // Admin - Get Revenue Data Endpoint (NEW ENDPOINT - PROTECTED) - UPDATED to call new functions
  router.get('/revenue-data', adminAuthMiddleware, async (req, res) => { // <-- Protected with adminAuthMiddleware
    try {
      // Calculate revenue for each service
      const wasteManagementFeesRevenue = await calculateWasteManagementFeesRevenue();
      const deathCertificateRevenue = await calculateDeathCertificateRevenue();
      const localGovIdRevenue = await calculateLocalGovIdRevenue(); // NEW - Calculate Local Gov ID revenue
      const clubAssociationRegRevenue = await calculateClubAssociationRegRevenue(); // NEW - Calculate Club Registration revenue
      const streetRegRevenue = await calculateStreetRegRevenue();          // NEW - Calculate Street Registration revenue
      const businessRegRevenue = await calculateBusinessRegRevenue();        // NEW - Calculate Business Registration revenue
  
  
      // Organize revenue data into a JSON response - UPDATED to include all services
      const revenueData = {
        wasteManagementFees: wasteManagementFeesRevenue,
        deathCertificate: deathCertificateRevenue,
        localGovId: localGovIdRevenue,             // NEW - Include Local Gov ID revenue
        clubAssociationRegistration: clubAssociationRegRevenue, // NEW - Include Club Registration revenue
        streetRegistration: streetRegRevenue,           // NEW - Include Street Registration revenue
        businessRegistration: businessRegRevenue,         // NEW - Include Business Registration revenue
      };
  
      res.status(200).json({ revenueData: revenueData }); // Send back revenue data in response
  
    } catch (error) {
      console.error('Admin - Get Revenue Data error:', error);
      res.status(500).json({ message: 'Failed to fetch revenue data', error: error.message });
    }
  });



// backend/routes/adminRoutes.js (Excerpt - Updated /api/admin/clusters/list Endpoint)
router.get('/clusters/list', adminAuthMiddleware, async (req, res) => { // <-- Protected with adminAuthMiddleware
  try {
      // In a real app, you might want to add pagination, filtering, and sorting to this endpoint
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
          `SELECT 
              clusters.id, 
              clusters.cluster_name, 
              clusters.lga, 
              clusters.description, 
              clusters.created_at,
              admins.username AS admin_username  -- Join to get assigned admin's username
          FROM clusters
          LEFT JOIN admins ON clusters.admin_id = admins.id` // LEFT JOIN with admins table
      );
      connection.release();

      const clustersList = rows.map(row => ({ // Map rows to create cluster objects with adminUsername
          id: row.id,
          cluster_name: row.cluster_name,
          lga: row.lga,
          description: row.description,
          createdAt: row.created_at,
          adminUsername: row.admin_username || 'Unassigned', // Use aliased username, default to 'Unassigned' if no admin assigned
      }));

      res.status(200).json({ clusters: clustersList }); // Send back the list of clusters

  } catch (error) {
      console.error('Admin - Get Cluster List error:', error);
      res.status(500).json({ message: 'Failed to fetch cluster list', error: error.message });
  }
});

// Admin - Create New Cluster Endpoint (NEW ENDPOINT - PROTECTED - SUPER ADMIN ONLY) - UPDATED to accept adminId
router.post('/clusters/create', adminAuthMiddleware, [ // <-- Protected with adminAuthMiddleware
  body('clusterName').notEmpty().withMessage('Cluster Name is required'),
  body('lga').notEmpty().withMessage('LGA Location is required'),
  body('adminId').optional().isInt().toInt().withMessage('Assigned Admin ID must be a valid integer'), // NEW - Optional adminId validation
  // Description is optional, no validation needed for description for now
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
  }

  // In a real app, you would typically authorize only Super Admins to create clusters
  if (req.admin.adminRole !== 'superadmin') { // Example: Only Super Admins can create clusters
      return res.status(403).json({ message: 'Forbidden: Only Super Admins can create clusters.' }); // 403 Forbidden
  }


  try {
      const { clusterName, lga, description, adminId } = req.body; // <-- Get adminId from request body

      const connection = await pool.getConnection();

      // Check if cluster name already exists (prevent duplicate cluster names)
      const [existingClusterRows] = await connection.execute(
          'SELECT cluster_name FROM clusters WHERE cluster_name = ?',
          [clusterName]
      );
      if (existingClusterRows.length > 0) {
          connection.release();
          return res.status(409).json({ message: 'Cluster name already exists' }); // 409 Conflict for existing cluster name
      }


      const query = `
          INSERT INTO clusters (cluster_name, lga, description, admin_id)  -- Include admin_id in INSERT query
          VALUES (?, ?, ?, ?)  -- Include admin_id placeholder in values
      `;
      const values = [
          clusterName, lga, description, adminId || null // Use adminId from request body, or null if not provided (optional admin assignment)
      ];

      await connection.execute(query, values);
      connection.release();

      res.status(201).json({ message: 'Cluster registered successfully' }); // 201 Created for successful registration

  } catch (error) {
      console.error('Cluster registration error:', error);
      res.status(500).json({ message: 'Failed to register cluster', error: error.message }); // 500 Internal Server Error
  }
});


// backend/routes/adminRoutes.js (Excerpt - Update Cluster Endpoint)
router.post('/clusters/:id/update', adminAuthMiddleware, [ // <-- Protected with adminAuthMiddleware
  body('clusterName').notEmpty().withMessage('Cluster Name is required'),
  body('lga').notEmpty().withMessage('LGA Location is required'),
  // Description is optional, no validation needed for description for now
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
  }

  const clusterIdToUpdate = req.params.id;
  const { clusterName, lga, description } = req.body;

  if (!clusterIdToUpdate || isNaN(clusterIdToUpdate)) {
      return res.status(400).json({ message: 'Invalid cluster ID' });
  }

  try {
      const connection = await pool.getConnection();

      const query = `
          UPDATE clusters
          SET cluster_name = ?, lga = ?, description = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
      `;
      const values = [
          clusterName, lga, description, clusterIdToUpdate
      ];

      await connection.execute(query, values);
      connection.release();

      res.status(200).json({ message: 'Cluster updated successfully' });

  } catch (error) {
      console.error('Error updating cluster:', error);
      res.status(500).json({ message: 'Failed to update cluster', error: error.message });
  }
});


// Admin - Get List of Users Endpoint (NEW ENDPOINT - PROTECTED)
router.get('/registered-users/list', adminAuthMiddleware, async (req, res) => { // <-- Protected with adminAuthMiddleware
  try {
      // In a real app, you might want to add pagination, filtering, and sorting to this endpoint
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
          'SELECT id, first_name, last_name, email_address, created_at FROM users' // Select relevant user data
      );
      connection.release();

      const userList = rows; // Rows is already an array of user objects

      res.status(200).json({ users: userList }); // Send back the list of users

  } catch (error) {
      console.error('Admin - Get User List error:', error);
      res.status(500).json({ message: 'Failed to fetch user list', error: error.message });
  }
});


// Admin - Delete User Endpoint (Protected)
router.delete('/users/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    connection.release();

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});



router.get('/applications/death-certificates', adminAuthMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, CONCAT(deceased_first_name, ' ', deceased_last_name) AS deceased_name, application_date AS created_at, status FROM death_certificate_applications"
    );
    res.status(200).json({ applications: rows });
  } catch (error) {
    console.error('Error fetching death certificate applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});


// POST approve application
router.post('/applications/death-certificates/:id/approve', adminAuthMiddleware, async (req, res) => {
  try {
    const appId = req.params.id;
    const [result] = await pool.execute(
      'UPDATE death_certificate_applications SET status = ? WHERE id = ?',
      ['Approved', appId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Application approved successfully' });
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to approve application' });
  }
});

// POST reject application
router.post('/applications/death-certificates/:id/reject', adminAuthMiddleware, async (req, res) => {
  try {
    const appId = req.params.id;
    const [result] = await pool.execute(
      'UPDATE death_certificate_applications SET status = ? WHERE id = ?',
      ['Rejected', appId]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Application rejected successfully' });
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reject application' });
  }
});



// GET all passport applications
router.get(
  '/applications/local-gov-ids',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id,
                applicant_first_name,
                applicant_last_name,
                applicant_other_names,
                date_of_birth,
                gender,
                occupation,
                home_address,
                lga_of_origin,
                phone_number,
                email_address,
                application_reason,
                status,
                application_date,
                passport_photo_path
         FROM local_government_id_applications`
      );
      res.status(200).json({ applications: rows });
    } catch (error) {
      console.error('Error fetching lga applications:', error);
      res
        .status(500)
        .json({ message: 'Failed to fetch passport applications' });
    }
  }
);

// Approve a passport application
router.post(
  '/applications/local-gov-ids/:id/approve',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE local_government_id_applications SET status = 'Approved' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res
          .status(200)
          .json({ message: 'Application approved successfully' });
      } else {
        res.status(404).json({ message: 'Application not found' });
      }
    } catch (error) {
      console.error('Error approving passport application:', error);
      res
        .status(500)
        .json({ message: 'Failed to approve passport application' });
    }
  }
);

// Reject a passport application
router.post(
  '/applications/local-gov-ids/:id/reject',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE local_government_id_applications SET status = 'Rejected' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res
          .status(200)
          .json({ message: 'Application rejected successfully' });
      } else {
        res.status(404).json({ message: 'Application not found' });
      }
    } catch (error) {
      console.error('Error rejecting passport application:', error);
      res
        .status(500)
        .json({ message: 'Failed to reject passport application' });
    }
  }
);

// (Optional) Delete a passport application
router.delete(
  '/applications/local-gov-ids/:id',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "DELETE FROM local_government_id_applications WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Application deleted successfully' });
      } else {
        res.status(404).json({ message: 'Application not found' });
      }
    } catch (error) {
      console.error('Error deleting passport application:', error);
      res
        .status(500)
        .json({ message: 'Failed to delete passport application' });
    }
  }
);



// GET all Club Association Applications
router.get(
  '/applications/club-associations',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id,
                club_association_name,
                nature_of_club_association,
                registration_address,
                lga_of_operation,
                contact_person_name,
                contact_person_phone,
                contact_person_email,
                registration_date,
                application_date,
                status,
                constitution_document_path
         FROM club_association_registrations`
      );
      res.status(200).json({ applications: rows });
    } catch (error) {
      console.error('Error fetching club association applications:', error);
      res.status(500).json({ message: 'Failed to fetch club association applications' });
    }
  }
);

// Approve a Club Association Application
router.post(
  '/applications/club-associations/:id/approve',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE club_association_registrations SET status = 'Approved' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Application approved successfully' });
      } else {
        res.status(404).json({ message: 'Application not found' });
      }
    } catch (error) {
      console.error('Error approving club association application:', error);
      res.status(500).json({ message: 'Failed to approve application' });
    }
  }
);

// Reject a Club Association Application
router.post(
  '/applications/club-associations/:id/reject',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE club_association_registrations SET status = 'Rejected' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Application rejected successfully' });
      } else {
        res.status(404).json({ message: 'Application not found' });
      }
    } catch (error) {
      console.error('Error rejecting club association application:', error);
      res.status(500).json({ message: 'Failed to reject application' });
    }
  }
);

// (Optional) Delete a Club Association Application
router.delete(
  '/applications/club-associations/:id',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "DELETE FROM club_association_registrations WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Application deleted successfully' });
      } else {
        res.status(404).json({ message: 'Application not found' });
      }
    } catch (error) {
      console.error('Error deleting club association application:', error);
      res.status(500).json({ message: 'Failed to delete application' });
    }
  }
);


// GET all Waste Management Fees Payments
router.get(
  '/applications/waste-management-fees-payments',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id,
                property_address,
                property_type,
                payment_amount,
                payment_date,
                transaction_reference,
                payment_method,
                payment_status,
                application_date
         FROM waste_management_fees_payments`
      );
      res.status(200).json({ applications: rows });
    } catch (error) {
      console.error('Error fetching waste management fees payments:', error);
      res.status(500).json({ message: 'Failed to fetch waste management fees payments' });
    }
  }
);

// Approve a Waste Management Fees Payment
router.post(
  '/applications/waste-management-fees-payments/:id/approve',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE waste_management_fees_payments SET payment_status = 'Approved' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Payment approved successfully' });
      } else {
        res.status(404).json({ message: 'Payment not found' });
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      res.status(500).json({ message: 'Failed to approve payment' });
    }
  }
);

// Reject a Waste Management Fees Payment
router.post(
  '/applications/waste-management-fees-payments/:id/reject',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE waste_management_fees_payments SET payment_status = 'Rejected' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Payment rejected successfully' });
      } else {
        res.status(404).json({ message: 'Payment not found' });
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      res.status(500).json({ message: 'Failed to reject payment' });
    }
  }
);

// (Optional) Delete a Waste Management Fees Payment
router.delete(
  '/applications/waste-management-fees-payments/:id',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "DELETE FROM waste_management_fees_payments WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Payment deleted successfully' });
      } else {
        res.status(404).json({ message: 'Payment not found' });
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      res.status(500).json({ message: 'Failed to delete payment' });
    }
  }
);



// GET all Street Registrations
router.get(
  '/applications/street-registrations',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id,
                street_name,
                lga_location,
                community_name,
                number_of_houses,
                street_length_meters,
                street_lighting_status,
                waste_disposal_system_status,
                registration_purpose,
                application_date,
                status,
                survey_map_path
         FROM street_registrations`
      );
      res.status(200).json({ applications: rows });
    } catch (error) {
      console.error('Error fetching street registrations:', error);
      res.status(500).json({ message: 'Failed to fetch street registrations' });
    }
  }
);

// Approve a Street Registration
router.post(
  '/applications/street-registrations/:id/approve',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE street_registrations SET status = 'Approved' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Street registration approved successfully' });
      } else {
        res.status(404).json({ message: 'Registration not found' });
      }
    } catch (error) {
      console.error('Error approving street registration:', error);
      res.status(500).json({ message: 'Failed to approve registration' });
    }
  }
);

// Reject a Street Registration
router.post(
  '/applications/street-registrations/:id/reject',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE street_registrations SET status = 'Rejected' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Street registration rejected successfully' });
      } else {
        res.status(404).json({ message: 'Registration not found' });
      }
    } catch (error) {
      console.error('Error rejecting street registration:', error);
      res.status(500).json({ message: 'Failed to reject registration' });
    }
  }
);

// (Optional) Delete a Street Registration
router.delete(
  '/applications/street-registrations/:id',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "DELETE FROM street_registrations WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Street registration deleted successfully' });
      } else {
        res.status(404).json({ message: 'Registration not found' });
      }
    } catch (error) {
      console.error('Error deleting street registration:', error);
      res.status(500).json({ message: 'Failed to delete registration' });
    }
  }
);

// GET all Business Registrations
router.get(
  '/applications/business-registrations',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id,
                business_name,
                business_type,
                business_sector,
                business_address,
                lga_of_operation,
                contact_email_address,
                contact_phone_number,
                registration_date,
                application_date,
                status,
                incorporation_document_path,
                cluster_id
         FROM business_registrations`
      );
      res.status(200).json({ applications: rows });
    } catch (error) {
      console.error('Error fetching business registrations:', error);
      res.status(500).json({ message: 'Failed to fetch business registrations' });
    }
  }
);

// Approve a Business Registration
router.post(
  '/applications/business-registrations/:id/approve',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE business_registrations SET status = 'Approved' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Business registration approved successfully' });
      } else {
        res.status(404).json({ message: 'Registration not found' });
      }
    } catch (error) {
      console.error('Error approving business registration:', error);
      res.status(500).json({ message: 'Failed to approve registration' });
    }
  }
);

// Reject a Business Registration
router.post(
  '/applications/business-registrations/:id/reject',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "UPDATE business_registrations SET status = 'Rejected' WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Business registration rejected successfully' });
      } else {
        res.status(404).json({ message: 'Registration not found' });
      }
    } catch (error) {
      console.error('Error rejecting business registration:', error);
      res.status(500).json({ message: 'Failed to reject registration' });
    }
  }
);

// (Optional) Delete a Business Registration
router.delete(
  '/applications/business-registrations/:id',
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const appId = req.params.id;
      const [result] = await pool.execute(
        "DELETE FROM business_registrations WHERE id = ?",
        [appId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Business registration deleted successfully' });
      } else {
        res.status(404).json({ message: 'Registration not found' });
      }
    } catch (error) {
      console.error('Error deleting business registration:', error);
      res.status(500).json({ message: 'Failed to delete registration' });
    }
  }
);



router.get('/cluster/dashboard', adminAuthMiddleware, async (req, res) => {
  console.log('User in request:', req.user); 
  

  try {
    const adminId = req.admin.id; // assuming your adminAuthMiddleware sets req.user
    console.log('Admin ID:', adminId); 
    const [clusters] = await pool.execute(
      'SELECT id, cluster_name, lga, description FROM clusters WHERE admin_id = ?',
      [adminId]
    );
    // If there are clusters, get business registrations for those clusters
    let businessRegistrations = [];
    if (clusters.length > 0) {
      // Extract cluster IDs from clusters array
      const clusterIds = clusters.map(c => c.id);
      const placeholders = clusterIds.map(() => '?').join(',');
      const [rows] = await pool.execute(
        `SELECT id, user_id, business_name, business_type, registration_date, cluster_id 
         FROM business_registrations 
         WHERE cluster_id IN (${placeholders})`,
         clusterIds
      );
      businessRegistrations = rows;
    }

    console.log('Business Registrations:', businessRegistrations);
    res.status(200).json({ clusters, businessRegistrations });
  } catch (error) {
    console.error('Error fetching cluster dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
});

router.get('/payments/dashboard', adminAuthMiddleware, async (req, res) => { 
  try {
    // Debugging: Try joining without the payment_status filter
    const [serviceRevenue] = await pool.execute(`
      SELECT s.service_name, SUM(p.payment_amount) AS totalRevenue
      FROM payments p
      JOIN services s ON p.service_id = s.id
      GROUP BY s.service_name
    `);
    
    console.log('Service Revenue:', serviceRevenue); // Debugging output

    // Debugging: Check the overall total revenue without the filter
    const [totalRevenueResult] = await pool.execute(`
      SELECT SUM(payment_amount) AS totalRevenue
      FROM payments
    `);

    console.log('Total Revenue Result:', totalRevenueResult); // Debugging output

    // Debugging: Get recent payments without the filter
    const [payments] = await pool.execute(`
      SELECT p.id, p.registration_id, s.service_name, p.payment_amount, p.payment_date, p.payment_status
      FROM payments p
      JOIN services s ON p.service_id = s.id
      ORDER BY p.payment_date DESC
      LIMIT 10
    `);

    console.log('Recent Payments:', payments); // Debugging output

    res.status(200).json({
      serviceRevenue,
      totalRevenue: totalRevenueResult[0].totalRevenue || 0,
      recentPayments: payments,
    });
  } catch (error) {
    console.error('Error fetching payments dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch payments dashboard', error: error.message });
  }
});



// // Cluster Admin Dashboard
// router.get('/cluster/dashboard', adminAuthMiddleware(['clusteradmin']), async (req, res) => {
//   try {
//     const adminId = req.admin.id;

//     const [clusters] = await pool.execute(
//       'SELECT id, cluster_name, lga, description FROM clusters WHERE admin_id = ?',
//       [adminId]
//     );

//     res.status(200).json({ clusters });
//   } catch (error) {
//     console.error('Error fetching cluster dashboard:', error);
//     res.status(500).json({ message: 'Failed to fetch dashboard data' });
//   }
// });

// // Bursary Admin Dashboard
// router.get('/bursary/dashboard', adminAuthMiddleware(['bursaryadmin']), async (req, res) => {
//   try {
//     const adminId = req.admin.id;

//     const [payments] = await pool.execute(
//       'SELECT * FROM payments WHERE bursary_admin_id = ?',
//       [adminId]
//     );

//     res.status(200).json({ payments });
//   } catch (error) {
//     console.error('Error fetching bursary dashboard:', error);
//     res.status(500).json({ message: 'Failed to fetch bursary dashboard data' });
//   }
// });

router.post('/otheradmins/login', async (req, res) => {
  console.log('Received data:', req.body); // Debugging log

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [admins] = await pool.execute(
      'SELECT * FROM admins WHERE username = ?', 
      [username]
    );

    console.log('Query result:', admins); // Check if admins were fetched

    if (!admins || admins.length === 0) {
      console.log('Invalid credentials - No matching admin');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = admins[0];

    // 🔥 Corrected: Use bcrypt.compare() for password validation
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      console.log('Invalid credentials - Wrong password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.admin_role }, // Ensure role field is correct
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    console.log('Login successful:', { username, role: admin.admin_role });

    res.json({ token, role: admin.admin_role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;