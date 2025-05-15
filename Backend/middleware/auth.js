const jwt = require('jsonwebtoken')
require('dotenv').config()


const Auth = (req, res, next) => {
    const token = req.cookies.token;
    const SECRET_KEY = process.env.JWT;

    if (!token){
        return res.status(401).json({
            mess: "User has no token"
        })
    }

    try{
        const verify = jwt.verify(token, SECRET_KEY);
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