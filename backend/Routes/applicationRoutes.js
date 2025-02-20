const express = require('express');
const pool = require('../config/db');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');


const router = express.Router();

router.post('/death-cert-apply', [
    body('deceasedFirstName').notEmpty().withMessage('Deceased First Name is required'),
    body('deceasedLastName').notEmpty().withMessage('Deceased Last Name is required'),
    body('dateOfDeath').notEmpty().isISO8601().toDate().withMessage('Date of Death is required and must be a valid date'),
    body('placeOfDeath').notEmpty().withMessage('Place of Death is required'),
    body('applicantRelationship').notEmpty().withMessage('Applicant Relationship is required'),
    body('applicantPhoneNumber').notEmpty().withMessage('Applicant Phone Number is required'),
    body('applicantEmailAddress').isEmail().withMessage('Applicant Email Address is invalid'),
    body('applicantAddress').notEmpty().withMessage('Applicant Address is required'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }
  
    try {
        const {
            deceasedFirstName, deceasedLastName, deceasedOtherNames, dateOfDeath, placeOfDeath,
            causeOfDeath, applicantRelationship, applicantPhoneNumber, applicantEmailAddress, applicantAddress
        } = req.body;
  
        // Retrieve user_id based on applicantEmailAddress
        const connection = await pool.getConnection();
        const [userRows] = await connection.execute(
            'SELECT id FROM users WHERE email_address = ?',
            [applicantEmailAddress]
        );
        const user = userRows[0];
        if (!user) {
            connection.release();
            return res.status(404).json({ message: 'User not found for application' });
        }
        const userId = user.id;
  
        // Retrieve the service details for "Death Certificate" from the services table
        const [serviceRows] = await connection.execute(
            'SELECT id, service_price FROM services WHERE service_name = ?',
            ['Death Certificate']
        );
        if (serviceRows.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Service "Death Certificate" not found' });
        }
        const serviceId = serviceRows[0].id;
        const servicePrice = serviceRows[0].service_price;
  
        // Insert the registration record, including the service_id
        const query = `
            INSERT INTO death_certificate_applications (
                user_id, deceased_first_name, deceased_last_name, deceased_other_names, date_of_death, place_of_death,
                cause_of_death, applicant_relationship, applicant_phone_number, applicant_email_address, applicant_address, service_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userId, deceasedFirstName, deceasedLastName, deceasedOtherNames, dateOfDeath, placeOfDeath,
            causeOfDeath, applicantRelationship, applicantPhoneNumber, applicantEmailAddress, applicantAddress, serviceId
        ];
  
        const [result] = await connection.execute(query, values);
        const registrationId = result.insertId;
        connection.release();
  
        res.status(201).json({
            message: 'Death Certificate Application submitted successfully',
            registrationId,
            service_id: serviceId,
            servicePrice
        });
    } catch (error) {
        console.error('Death Certificate Application error:', error);
        res.status(500).json({ message: 'Failed to submit Death Certificate Application', error: error.message });
    }
  });


  
  
  

// Get Death Certificate Application Details by ID Endpoint (UPDATED PATH)
router.get('/details/:id', async (req, res) => { // <-- Route path is now '/details/:id'
    const applicationId = req.params.id;

    if (!applicationId || isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM death_certificate_applications WHERE id = ?',
            [applicationId]
        );
        connection.release();

        const applicationDetails = rows[0]; // Expecting only one application with given ID

        if (!applicationDetails) {
            return res.status(404).json({ message: 'Death Certificate Application not found' });
        }

        res.status(200).json({ application: applicationDetails }); // Send back detailed application data

    } catch (error) {
        console.error('Error fetching Death Certificate Application details:', error);
        res.status(500).json({ message: 'Failed to fetch Death Certificate Application details', error: error.message });
    }
});

// Get Business Registration Details by ID Endpoint
router.get('/business-register/details/:id', async (req, res) => {
    const applicationId = req.params.id;

    if (!applicationId || isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM business_registrations WHERE id = ?',
            [applicationId]
        );
        connection.release();

        const applicationDetails = rows[0];

        if (!applicationDetails) {
            return res.status(404).json({ message: 'Business Registration Application not found' });
        }

        res.status(200).json({ application: applicationDetails });

    } catch (error) {
        console.error('Error fetching Business Registration Application details:', error);
        res.status(500).json({ message: 'Failed to fetch Business Registration Application details', error: error.message });
    }
});


// Get Street Registration Details by ID Endpoint
router.get('/street-registration/details/:id', async (req, res) => {
    const applicationId = req.params.id;

    if (!applicationId || isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM street_registrations WHERE id = ?',
            [applicationId]
        );
        connection.release();

        const applicationDetails = rows[0];

        if (!applicationDetails) {
            return res.status(404).json({ message: 'Street Registration Application not found' });
        }

        res.status(200).json({ application: applicationDetails });

    } catch (error) {
        console.error('Error fetching Street Registration Application details:', error);
        res.status(500).json({ message: 'Failed to fetch Street Registration Application details', error: error.message });
    }
});


// Get Club Registration Details by ID Endpoint
router.get('/club-registration/details/:id', async (req, res) => {
    const applicationId = req.params.id;

    if (!applicationId || isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM club_association_registrations WHERE id = ?',
            [applicationId]
        );
        connection.release();

        const applicationDetails = rows[0];

        if (!applicationDetails) {
            return res.status(404).json({ message: 'Club Registration Application not found' });
        }

        res.status(200).json({ application: applicationDetails });

    } catch (error) {
        console.error('Error fetching Club Registration Application details:', error);
        res.status(500).json({ message: 'Failed to fetch Club Registration Application details', error: error.message });
    }
});
// Get Local Government Registration Details by ID Endpoint
router.get('/lga-registration/details/:id', async (req, res) => {
    const applicationId = req.params.id;

    if (!applicationId || isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM local_government_registrations WHERE id = ?',
            [applicationId]
        );
        connection.release();

        const applicationDetails = rows[0];

        if (!applicationDetails) {
            return res.status(404).json({ message: 'Local Government Registration Application not found' });
        }

        res.status(200).json({ application: applicationDetails });

    } catch (error) {
        console.error('Error fetching Local Government Registration Application details:', error);
        res.status(500).json({ message: 'Failed to fetch Local Government Registration Application details', error: error.message });
    }
});


// Get Waste Management Registration Details by ID Endpoint
router.get('/waste-management/details/:id', async (req, res) => {
    const applicationId = req.params.id;

    if (!applicationId || isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM waste_management_fees_payments WHERE id = ?',
            [applicationId]
        );
        connection.release();

        const applicationDetails = rows[0];

        if (!applicationDetails) {
            return res.status(404).json({ message: 'Waste Management Registration Application not found' });
        }

        res.status(200).json({ application: applicationDetails });

    } catch (error) {
        console.error('Error fetching Waste Management Registration Application details:', error);
        res.status(500).json({ message: 'Failed to fetch Waste Management Registration Application details', error: error.message });
    }
});


router.post('/lga-cert-apply', [
    body('applicantFirstName').notEmpty().withMessage('First Name is required'),
    body('applicantLastName').notEmpty().withMessage('Last Name is required'),
    body('dateOfBirth').notEmpty().isISO8601().toDate().withMessage('Date of Birth is required and must be a valid date'),
    body('gender').notEmpty().isIn(['male', 'female', 'other']).withMessage('Gender is required and must be valid'),
    body('homeAddress').notEmpty().withMessage('Home Address is required'),
    body('lgaOfOrigin').notEmpty().withMessage('LGA of Origin is required'),
    body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
    body('applicantEmailAddress').isEmail().withMessage('Invalid email address'),
    // Add more validations as needed
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    try {
        const {
            applicantFirstName, applicantLastName, applicantOtherNames, dateOfBirth, gender,
            occupation, homeAddress, lgaOfOrigin, phoneNumber, applicantEmailAddress, applicationReason
        } = req.body;

        // In a real app, get user_id from authenticated user context
        // For now, assume emailAddress is sent and fetch user_id
        const userEmail = applicantEmailAddress; // Using applicant email for now to simulate user context
        const connection = await pool.getConnection();
        const [userRows] = await connection.execute('SELECT id FROM users WHERE email_address = ?', [userEmail]);
        const user = userRows[0];

        if (!user) {
            connection.release();
            return res.status(404).json({ message: 'User not found for application' }); // In real app, user should be authenticated
        }
        const userId = user.id;

        // **Retrieve the service details for "Local Government ID"**
        const [serviceRows] = await connection.execute(
            'SELECT id, service_price FROM services WHERE service_name = ?',
            ['Local Government ID'] // **Service Name**
        );
        if (serviceRows.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Service "Local Government ID" not found' });
        }
        const serviceId = serviceRows[0].id;
        const servicePrice = serviceRows[0].service_price;

        const query = `
            INSERT INTO local_government_id_applications (
                user_id, applicant_first_name, applicant_last_name, applicant_other_names, date_of_birth, gender,
                occupation, home_address, lga_of_origin, phone_number, email_address, application_reason, service_id  -- **Added service_id**
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) -- **Added ? for service_id**
        `;
        const values = [
            userId, applicantFirstName, applicantLastName, applicantOtherNames, dateOfBirth, gender,
            occupation, homeAddress, lgaOfOrigin, phoneNumber, applicantEmailAddress, applicationReason, serviceId // **Added serviceId**
        ];

        const [result] = await connection.execute(query, values); // Capture result for insertId
        const registrationId = result.insertId; // Get the insertId

        connection.release();

        res.status(201).json({
            message: 'Local Government ID Application submitted successfully',
            registrationId, // **Return registrationId**
            service_id: serviceId, // **Return service_id**
            servicePrice // **Return servicePrice**
        });

    } catch (error) {
        console.error('Local Government ID Application error:', error);
        res.status(500).json({ message: 'Failed to submit Local Government ID Application', error: error.message });
    }
});

router.post('/club-register', [
    body('clubAssociationName').notEmpty().withMessage('Club/Association Name is required'),
    body('registrationAddress').notEmpty().withMessage('Registration Address is required'),
    body('lgaOfOperation').notEmpty().withMessage('LGA of Operation is required'),
    body('contactPersonName').notEmpty().withMessage('Contact Person Name is required'),
    body('contactPersonPhone').notEmpty().withMessage('Contact Person Phone is required'),
    body('contactPersonEmail').isEmail().withMessage('Invalid Contact Person Email Address'),
    body('registrationDate').notEmpty().isISO8601().toDate().withMessage('Registration Date is required and must be a valid date'),
    // Add more validations as needed
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    try {
        const {
            clubAssociationName, natureOfClubAssociation, registrationAddress, lgaOfOperation,
            contactPersonName, contactPersonPhone, contactPersonEmail, registrationDate
        } = req.body;

        // In real app, get user_id from authenticated user context
        // For now, assume emailAddress is sent and fetch user_id
        const userEmail = contactPersonEmail; // Using contact person email for now to simulate user context
        const connection = await pool.getConnection();
        const [userRows] = await connection.execute('SELECT id FROM users WHERE email_address = ?', [userEmail]);
        const user = userRows[0];

        if (!user) {
            connection.release();
            return res.status(404).json({ message: 'User not found for registration' }); // In real app, user should be authenticated
        }
        const userId = user.id;

        // **Retrieve the service details for "Club Association Registration"**
        const [serviceRows] = await connection.execute(
            'SELECT id, service_price FROM services WHERE service_name = ?',
            ['Club Association Registration'] // **Service Name**
        );
        if (serviceRows.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Service "Club Association Registration" not found' });
        }
        const serviceId = serviceRows[0].id;
        const servicePrice = serviceRows[0].service_price;

        const query = `
            INSERT INTO club_association_registrations (
                user_id, club_association_name, nature_of_club_association, registration_address, lga_of_operation,
                contact_person_name, contact_person_phone, contact_person_email, registration_date, service_id -- **Added service_id**
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) -- **Added ? for service_id**
        `;
        const values = [
            userId, clubAssociationName, natureOfClubAssociation, registrationAddress, lgaOfOperation,
            contactPersonName, contactPersonPhone, contactPersonEmail, registrationDate, serviceId // **Added serviceId**
        ];

        const [result] = await connection.execute(query, values); // Capture result for insertId
        const registrationId = result.insertId; // Get the insertId
        connection.release();

        res.status(201).json({
            message: 'Club/Association registered successfully',
            registrationId, // **Return registrationId**
            service_id: serviceId, // **Return service_id**
            servicePrice // **Return servicePrice**
        });

    } catch (error) {
        console.error('Club/Association registration error:', error);
        res.status(500).json({ message: 'Failed to register Club/Association', error: error.message });
    }
});


// Waste Management Fees Payment Endpoint
router.post('/pay-waste-fees', [
    body('propertyAddress').notEmpty().withMessage('Property Address is required'),
    body('propertyType').notEmpty().isIn(['residential', 'commercial']).withMessage('Property Type is required and must be valid'),
    body('paymentAmount').isDecimal({ decimal_places: '2' }).toFloat().withMessage('Payment Amount is required and must be a valid amount'),
    body('paymentMethod').notEmpty().isIn(['online', 'bank_transfer']).withMessage('Payment Method is required and must be valid'),
    body('applicantEmailAddress').isEmail().withMessage('Invalid email address'), // Using applicantEmailAddress for user context simulation
    body('paymentDate').notEmpty().isISO8601().toDate().withMessage('Payment Date is required and must be a valid date'),

    // In a real app, you would typically get payment details from a payment gateway response,
    // rather than directly from user input in the initial request.
    // For this simplified example, we are taking payment details directly from the form.
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    try {
        const {
            propertyAddress, propertyType, paymentAmount, paymentMethod, applicantEmailAddress, paymentDate
        } = req.body;

        // In a real app, get user_id from authenticated user context
        const userEmail = applicantEmailAddress; // Using applicant email for now to simulate user context
        const connection = await pool.getConnection();
        const [userRows] = await connection.execute('SELECT id FROM users WHERE email_address = ?', [userEmail]);
        const user = userRows[0];

        if (!user) {
            connection.release();
            return res.status(404).json({ message: 'User not found for payment' }); // In real app, user should be authenticated
        }
        const userId = user.id;

        // In a real application, integrate with a payment gateway here.
        // For this example, we'll simulate a successful payment.
        const paymentStatus = 'pending'; // In real app, status from payment gateway
        const transactionReference = uuidv4(); // Generate a unique transaction reference

        const query = `
            INSERT INTO waste_management_fees_payments (
                user_id, property_address, property_type, payment_amount, payment_date,
                payment_method, payment_status , transaction_reference
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userId, propertyAddress, propertyType, paymentAmount, paymentDate,
            paymentMethod, paymentStatus, transactionReference
        ];

        await connection.execute(query, values);
        connection.release();

        res.status(201).json({ message: 'Waste Management Fees payment successful', transactionReference });

    } catch (error) {
        console.error('Waste Management Fees payment error:', error);
        res.status(500).json({ message: 'Failed to process Waste Management Fees payment', error: error.message });
    }
});

// Street Registration Endpoint
router.post('/street-register', [
    body('streetName').notEmpty().withMessage('Street Name is required'),
    body('lgaLocation').notEmpty().withMessage('LGA Location is required'),
    // Add more validations as needed
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    try {
        const {
            streetName, lgaLocation, communityName, numberOfHouses, streetLengthMeters,
            streetLightingStatus, wasteDisposalSystemStatus, registrationPurpose, applicantEmailAddress
        } = req.body;

        // In real app, get user_id from authenticated user context
        // For now, assume emailAddress is sent and fetch user_id
        const userEmail = applicantEmailAddress; // Using applicant email for now to simulate user context
        const connection = await pool.getConnection();
        const [userRows] = await connection.execute('SELECT id FROM users WHERE email_address = ?', [userEmail]);
        const user = userRows[0];

        if (!user) {
            connection.release();
            return res.status(404).json({ message: 'User not found for registration' }); // In real app, user should be authenticated
        }
        const userId = user.id;


        const query = `
            INSERT INTO street_registrations (
                user_id, street_name, lga_location, community_name, number_of_houses, street_length_meters,
                street_lighting_status, waste_disposal_system_status, registration_purpose
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userId, streetName, lgaLocation, communityName, numberOfHouses, streetLengthMeters,
            streetLightingStatus, wasteDisposalSystemStatus, registrationPurpose
        ];

        await connection.execute(query, values);
        connection.release();

        res.status(201).json({ message: 'Street registered successfully' });

    } catch (error) {
        console.error('Street registration error:', error);
        res.status(500).json({ message: 'Failed to register street', error: error.message });
    }
});



// Business Registration Endpoint
router.post('/business-register', [
    body('businessName').notEmpty().withMessage('Business Name is required'),
    body('businessType').notEmpty().isIn(['sole_proprietorship', 'partnership', 'limited_liability_company', 'other']).withMessage('Business Type is required and must be valid'),
    body('businessSector').notEmpty().withMessage('Business Sector is required'),
    body('businessAddress').notEmpty().withMessage('Business Address is required'),
    // We now expect cluster_id from the select; remove lgaOfOperation input.
    body('cluster_id').notEmpty().withMessage('Please select a local government cluster'),
    body('contactEmailAddress').isEmail().withMessage('Invalid Contact Email Address'),
    body('contactPhoneNumber').notEmpty().withMessage('Contact Phone Number is required'),
    body('registrationDate').notEmpty().isISO8601().toDate().withMessage('Registration Date is required and must be a valid date'),
    // Additional validations as needed
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.mapped() });
    }

    try {
        const {
            businessName, businessType, businessSector, businessAddress, cluster_id,
            contactEmailAddress, contactPhoneNumber, registrationDate
        } = req.body;

        // Get user_id based on contactEmailAddress
        const connection = await pool.getConnection();
        const [userRows] = await connection.execute('SELECT id FROM users WHERE email_address = ?', [contactEmailAddress]);
        const user = userRows[0];

        if (!user) {
            connection.release();
            return res.status(404).json({ message: 'User not found for registration' });
        }
        const userId = user.id;

        const query = `
            INSERT INTO business_registrations (
                user_id, business_name, business_type, business_sector, business_address, 
                lga_of_operation, contact_email_address, contact_phone_number, registration_date, cluster_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // For LGA of Operation, you may want to fetch the lga from the clusters table
        // For example, you could do a subquery or look it up on the frontend.
        // Here we assume that the clusters table supplies the LGA. If you don't need to store it separately, you can pass a blank value.
        const lgaOfOperation = ''; // or you could fetch this from clusters table using cluster_id
        const values = [
            userId, businessName, businessType, businessSector, businessAddress, lgaOfOperation,
            contactEmailAddress, contactPhoneNumber, registrationDate, cluster_id
        ];

        const [result] = await connection.execute(query, values);
        const registrationId = result.insertId;
        connection.release();

        res.status(201).json({ message: 'Business registered successfully', registrationId });

    } catch (error) {
        console.error('Business registration error:', error);
        res.status(500).json({ message: 'Failed to register business', error: error.message });
    }
});


router.get('/death-cert/pdf/:id', async (req, res) => {
    const applicationId = req.params.id;

    if (!applicationId || isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM death_certificate_applications WHERE id = ?',
            [applicationId]
        );
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const application = rows[0];

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        const { width, height } = page.getSize();

        page.drawText('Death Certificate Application', { x: 200, y: height - 50, size: 20, color: rgb(0, 0, 0) });

        // Add application details to the PDF
        page.drawText(`Applicant Name: ${application.applicant_relationship}`, { x: 50, y: height - 100, size: 12 });
        page.drawText(`Phone Number: ${application.applicant_phone_number}`, { x: 50, y: height - 120, size: 12 });
        page.drawText(`Email: ${application.applicant_email_address}`, { x: 50, y: height - 140, size: 12 });
        page.drawText(`Address: ${application.applicant_address}`, { x: 50, y: height - 160, size: 12 });

        page.drawText(`Deceased Name: ${application.deceased_first_name} ${application.deceased_last_name}`, { x: 50, y: height - 200, size: 12 });
        page.drawText(`Date of Death: ${application.date_of_death}`, { x: 50, y: height - 220, size: 12 });
        page.drawText(`Place of Death: ${application.place_of_death}`, { x: 50, y: height - 240, size: 12 });
        page.drawText(`Cause of Death: ${application.cause_of_death}`, { x: 50, y: height - 260, size: 12 });

        // Serialize the PDF
        const pdfBytes = await pdfDoc.save();

        // Send PDF as a downloadable file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Death_Certificate_${applicationId}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
});

router.get('/generate-pdf/:applicationType/:id', async (req, res) => {
    const { applicationType, id } = req.params;

    try {
        const connection = await pool.getConnection();

        let tableName = '';
        let contentColumns = '*';

        // Map application type to the correct database table
        switch (applicationType) {
            case 'death-certificate':
                tableName = 'death_certificate_applications';
                break;
            case 'local-gov-id':
                tableName = 'local_government_id_applications';
                break;
            case 'club-registration':
                tableName = 'club_association_registrations';
                break;
            case 'waste-fees':
                tableName = 'waste_management_fees_payments';
                break;
            case 'street-registration':
                tableName = 'street_registrations';
                break;
            case 'business-registration':
                tableName = 'business_registrations';
                break;
            default:
                return res.status(400).json({ message: 'Invalid application type' });
        }

        // Fetch the correct data from the database
        const query = `SELECT ${contentColumns} FROM ${tableName} WHERE id = ?`;
        const [rows] = await connection.execute(query, [id]);

        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No data found for this application' });
        }

        // Assign correct application data
        const application = rows[0];
        application.type = applicationType.replace(/-/g, ' '); // Convert slug format to readable text

        // Generate PDF content dynamically based on application type
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();

        page.drawText(`Application Type: ${application.type}`, { x: 50, y: height - 80, size: 14 });

        switch (application.type) {
            case 'death certificate':
                page.drawText(`Applicant Name: ${application.applicant_name}`, { x: 50, y: height - 100, size: 12 });
                page.drawText(`Deceased: ${application.deceased_first_name} ${application.deceased_last_name}`, { x: 50, y: height - 120, size: 12 });
                page.drawText(`Date of Death: ${application.date_of_death}`, { x: 50, y: height - 140, size: 12 });
                page.drawText(`Cause of Death: ${application.cause_of_death}`, { x: 50, y: height - 160, size: 12 });
                break;

            case 'local government id':
                page.drawText(`Full Name: ${application.full_name}`, { x: 50, y: height - 100, size: 12 });
                page.drawText(`Date of Birth: ${application.date_of_birth}`, { x: 50, y: height - 120, size: 12 });
                page.drawText(`Address: ${application.address}`, { x: 50, y: height - 140, size: 12 });
                page.drawText(`ID Number: ${application.id_number}`, { x: 50, y: height - 160, size: 12 });
                break;

            case 'club association registration':
                page.drawText(`Club Name: ${application.club_name}`, { x: 50, y: height - 100, size: 12 });
                page.drawText(`Founder: ${application.founder_name}`, { x: 50, y: height - 120, size: 12 });
                page.drawText(`Established Date: ${application.established_date}`, { x: 50, y: height - 140, size: 12 });
                page.drawText(`Purpose: ${application.purpose}`, { x: 50, y: height - 160, size: 12 });
                break;

            case 'waste management fees payment':
                page.drawText(`Property Owner: ${application.owner_name}`, { x: 50, y: height - 100, size: 12 });
                page.drawText(`Property Address: ${application.property_address}`, { x: 50, y: height - 120, size: 12 });
                page.drawText(`Payment Amount: ${application.payment_amount}`, { x: 50, y: height - 140, size: 12 });
                page.drawText(`Payment Date: ${application.payment_date}`, { x: 50, y: height - 160, size: 12 });
                break;

            case 'street registration':
                page.drawText(`Street Name: ${application.street_name}`, { x: 50, y: height - 100, size: 12 });
                page.drawText(`Location: ${application.location}`, { x: 50, y: height - 120, size: 12 });
                page.drawText(`Chairperson: ${application.chairperson_name}`, { x: 50, y: height - 140, size: 12 });
                break;

            case 'business registration':
                page.drawText(`Business Name: ${application.business_name}`, { x: 50, y: height - 100, size: 12 });
                page.drawText(`Owner: ${application.owner_name}`, { x: 50, y: height - 120, size: 12 });
                page.drawText(`Industry: ${application.industry}`, { x: 50, y: height - 140, size: 12 });
                page.drawText(`Address: ${application.business_address}`, { x: 50, y: height - 160, size: 12 });
                break;

            default:
                page.drawText('No PDF template available for this application type.', { x: 50, y: height - 100, size: 12 });
                break;
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${applicationType}-document.pdf"`);
        res.send(pdfBytes);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
});






// View All Applications Endpoint
router.get('/view-all', async (req, res) => {
    console.log('Backend - View All Applications request received'); // <-- Add log
    console.log('Backend - req.url:', req.url); // <-- Add log
    console.log('Backend - req.query:', req.query); // <-- Add log

    try {
        // In a real app, get user_id from authenticated user context
        // For now, assume emailAddress is sent as a query parameter for testing
        const userEmail = req.query.emailAddress; // Get email from query parameters for testing
        if (!userEmail) {
            return res.status(400).json({ message: 'Email address is required to view applications' });
        }

        const connection = await pool.getConnection();
        const [userRows] = await connection.execute('SELECT id FROM users WHERE email_address = ?', [userEmail]);
        const user = userRows[0];

        if (!user) {
            connection.release();
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = user.id;

        // Fetch applications from all tables (adjust table names as needed)
        const [deathCertApps] = await connection.execute('SELECT id, application_date, status FROM death_certificate_applications WHERE user_id = ?', [userId]);
        const [localGovIdApps] = await connection.execute('SELECT id, application_date, status FROM local_government_id_applications WHERE user_id = ?', [userId]);
        const [clubRegApps] = await connection.execute('SELECT id, application_date, status FROM club_association_registrations WHERE user_id = ?', [userId]);
        const [wasteFeesApps] = await connection.execute('SELECT id, application_date, payment_status AS status FROM waste_management_fees_payments WHERE user_id = ?', [userId]);
        const [streetRegApps] = await connection.execute('SELECT id, application_date,  status FROM street_registrations WHERE user_id = ?', [userId]);
        const [businessRegApps] = await connection.execute('SELECT id, application_date, status FROM business_registrations WHERE user_id = ?', [userId]);

        connection.release();

        // Combine applications into a single array with type information
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
        console.error('View All Applications error:', error);
        res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
    }
});

router.get('/registrations/:id', async (req, res) => {
    const registrationId = req.params.id;
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, user_id, service_id FROM death_certificate_applications WHERE id = ?',
        [registrationId]
      );
      connection.release();
      if (rows.length > 0) {
        res.status(200).json({ registration: rows[0] });
      } else {
        res.status(404).json({ message: 'Registration not found' });
      }
    } catch (error) {
      console.error('Error fetching registration details:', error);
      res.status(500).json({ message: 'Failed to fetch registration details', error: error.message });
    }
  });
  
  

module.exports = router;