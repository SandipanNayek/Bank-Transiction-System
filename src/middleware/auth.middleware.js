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

async function authSystemUserMiddleware(req , res , next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    const isBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }

        req.user = user

        return next()
    }
    catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

module.exports = {
    authMiddleware ,
    authSystemUserMiddleware
}