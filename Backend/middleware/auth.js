const jwt = require('jsonwebtoken')
require('dotenv').config()


const Auth = (req, res, next) => {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!token){
        return res.status(401).json({
            message: "Access denied. No token provided."
        })
    }

    try{
        const verify = jwt.verify(token, JWT_SECRET);
        req.user = verify;
        next();
    }
    catch(err){
        res.status(403).json({
            message: "Invalid or expired token",
            error: err.message 
        })
    }

}

module.exports = Auth