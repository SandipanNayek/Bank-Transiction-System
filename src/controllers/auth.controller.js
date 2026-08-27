const userModel = require("../models/user.model")
 const jwt = require("jsonwebtoken")
const emailService = require("../service/email.service")

 /* user register controller */
async function userRegisterController(req, res){

    const {email , password , name }= req.body

    const isExists = await userModel.findOne({
        email:email
    })

    if(isExists){
        return res.status(422).json({
            message:"user already exists with this email",
            status:"failed"
        })
    }

    const user = await userModel.create({
        email , password , name
    })
    const token = jwt.sign({
        userId:user._id
    },
    process.env.JWT_SECRET,
        {
            expiresIn:"3d"
        }
    )
    const options = {
      httpOnly: true,
      secure: true
    }
    res.cookie("token" , token , options)
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name: user.name
        },
        token
    })
     await emailService.sendRegistrationEmail(user.email , user.name)

}
/*user login controller*/
async function userLoginController(req , res){
    const {email , password} = req.body

    const user = await userModel.findOne({email}).select("+password")

    if(!user){
        return res.status(401).json({
            message: "Email or password is invalid"
        })
    }

    const isValidPassword = await user.isPasswordCorrect(password)

     if(!isValidPassword){
        return res.status(401).json({
            message: "Email or password is invalid"
        })
     }

     const token = jwt.sign({
        userId:user._id
    },
    process.env.JWT_SECRET,
        {
            expiresIn:"3d"
        }
    )
    const options = {
      httpOnly: true,
      secure: true
    }
    res.cookie("token" , token , options)
    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name: user.name
        },
        token
    })

   
}
  
module.exports = {
    userRegisterController,
    userLoginController
}

