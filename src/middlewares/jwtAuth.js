const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const {User,Admin}= require("../models")
const { userService, authService } = require("../services");
const dotenv = require('dotenv'); 
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
dotenv.config()

const jwtAuth = () => async (req, res, next) => {
    
    return new Promise( async (resolve, reject) => {
        try {
            const token = req.headers?.authorization?.split(" ")[1]
            if (!token) return res.status(401).json({ message: 'Unauthorized' });
        

            jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                if (err) return res.status(401).json({ message: 'Token is not valid' });
                console.log(decoded.user + "decoded")
                req.user = decoded.user;
                console.log("VERIFIED") // Extract user data from the token
            });

            resolve(); 
        } catch(err) {
            console.log("JWTAuthError:", err);
            reject(new ApiError(httpStatus.UNAUTHORIZED, "Failed to authenticate"))
        }
    }).then(() => next()).catch((err) => next(err));
}


module.exports = {jwtAuth}