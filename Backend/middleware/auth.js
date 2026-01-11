const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // ✅ CHECK COOKIES FIRST, THEN HEADERS
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log("✅ Auth successful:", { id: decoded.id, role: decoded.role });
    
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = auth;