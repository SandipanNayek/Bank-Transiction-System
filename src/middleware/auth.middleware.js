const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")


async function authMiddleware( req , res, next){
    try {
        const token = req.cookies?.token || req.headers("authorization").replace("Bearer " , "")
    
        if(!token){
            return res.status(401).json({
                message:"Unauthorized request"
            })
        }
        const decodeToken = jwt.verify(token , process.env.JWT_SECRET)
    
        const user = await userModel.findById(decodeToken?.userId)
        
    
        if(!user){
            return res.status(401).json({
                message:"Invalid Acess Token"
            })
        }
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            message:"Unauthorized access || token is invalid"
        })
    }
}

module.exports = {authMiddleware}