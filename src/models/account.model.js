const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({ 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true , "user is required for creating an account"],
        index : true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE" , "FROZEN" , "CLOSED"], 
            message:"status should be either ACTIVE , FROZEN or CLOSED"
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true , "currency is required for creating an account"],
        default:"INR"
    },
    
} , {timestamps:true})

accountSchema.index({user: 1 , status:1})   /* compund idx */


const accountModel = mongoose.model("account" , accountSchema)

module.exports = accountModel