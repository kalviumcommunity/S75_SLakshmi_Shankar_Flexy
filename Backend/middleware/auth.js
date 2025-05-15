const jwt = require('jsonwebtoken')
require('dotenv').config()


const Auth = (req, res, next) => {
    const token = req.cookies.token;
    const JWT_SECERT = process.env.JWT_SECRET;

    if (!token){
        return res.status(401).json({
            mess: "User has no token"
        })
    }

    try{
        const verify = jwt.verify(token, JWT_SECERT);
        req.user = verify;
        next();
    }
    catch(err){
        res.status(403).json({
            Error_mess: err.message 
        })
    }

}

module.exports = Auth