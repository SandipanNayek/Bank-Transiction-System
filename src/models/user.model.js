const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required: [true, "Email is required for creating an account"],
        trim: true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique:[true , "Email already exist."]
    },
    name:{
       type: String,
       required: [true, "Name is required for creating an account"],
    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6 , "password should be contain atleast 6 character"],
        select: false
    },
    
    
} , {
    timestamps: true
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return ;

    this.password = await bcrypt.hash(this.password, 10);
    return;
    
})

userSchema.methods.isPasswordCorrect = async function(password){
 return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user" , userSchema)

module.exports = userModel
