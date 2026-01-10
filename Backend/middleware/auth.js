const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No token provided.",
        success: false 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expired. Please login again.",
        success: false 
      });
    }
    
    return res.status(403).json({ 
      message: "Invalid token",
      success: false 
    });
  }
};

module.exports = auth;
