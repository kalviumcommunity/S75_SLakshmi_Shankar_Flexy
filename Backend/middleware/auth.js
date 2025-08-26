const jwt = require('jsonwebtoken')
require('dotenv').config()


const Auth = (req, res, next) => {
    const token = req.cookies.token;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!token){
        return res.status(401).json({
            message: "User has no token"
        })
    }

    try{
        const verify = jwt.verify(token, JWT_SECRET);
        req.user = verify;
        next();
    }
    catch(err){
        res.status(403).json({
            message: "Invalid token",
            error: err.message 
        })
    }

}

module.exports = Auth