const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({ 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true , "user is required for creating an account"]
    },
    status:{
        enum:{
            values:["ACTIVE" , "FROZEN" , "CLOSED"], 
            message:"status should be either ACTIVE , FROZEN or CLOSED"
        }
    },
    currency:{
        type:String,
        required:[true , "currency is required for creating an account"],
        default:"INR"
    },
    
} , {timestamps:true})

const accountModel = mongoose.model("account" , accountSchema)

module.exports = accountModel