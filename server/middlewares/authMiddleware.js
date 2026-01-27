import { Types } from "mongoose";
import User from "../models/User.js";
import { Responses } from "../utils/response.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async(req,res,next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return Responses.failResponse(res, 'Authentication token is required', 401);
        }
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        const { id, role } = decodedToken;
        if(!Types.ObjectId.isValid(id)){
            return Responses.errorResponse(res,"Invalid user id format",406);
        }
        const obtainedUser = await User.findById(id);
        if(!obtainedUser){
            return Responses.errorResponse(res,"User not found",404);
        }
        if(obtainedUser.role!==role){
            return Responses.errorResponse(res,"Malformed user credentials",401);
        }
        req.user = obtainedUser;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return Responses.errorResponse(res,'Token has expired. Please log in again.',401);
        }
        if (error.name === 'JsonWebTokenError') {
            return Responses.errorResponse(res,'Invalid token. Authorization denied.',401);
        }
        console.log('JWT verification error:', error.message);
        return Responses.failResponse(res, 'User unauthorized', 401);
    }
}


export const authorize = (roles) => {
    return (req, res, next) => {
        try {
            if (req.user.role === "admin") {
                return next();
            }
            if (req.user.role!==roles) {
                return Responses.errorResponse(res, `User role ${req.user.role} is not authorized to access this route`, 403);
            }
            next();
        } catch (error) {
            console.log('authorize middleware error:', error.message);
            return Responses.errorResponse(res, 'Server error', 500);
        }
    };
};