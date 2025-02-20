// const jwt = require('jsonwebtoken');

// const adminAuthMiddleware = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract JWT from Authorization header

//   if (!token) {
//     return res.status(401).json({ message: 'Admin authentication required: No token provided' }); // 401 Unauthorized - No token
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify JWT using secret key
//     req.admin = decoded; // Attach admin payload to request object (req.admin)
//     next(); // Proceed to the next middleware or route handler

//   } catch (error) {
//     console.error('JWT verification error:', error);
//     return res.status(401).json({ message: 'Admin authentication failed: Invalid token' }); // 401 Unauthorized - Invalid token
//   }
// };

// module.exports = adminAuthMiddleware;


const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Admin authentication required: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Decoded Token:', decoded); // Debugging

    if (!decoded || !decoded.adminId) {
      return res.status(401).json({ message: 'Invalid token payload: No admin ID' });
    }

    // Ensure req.admin contains correct properties
    req.admin = { id: decoded.adminId, role: decoded.adminRole };

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Admin authentication failed: Invalid token' });
  }
};

module.exports = adminAuthMiddleware;



