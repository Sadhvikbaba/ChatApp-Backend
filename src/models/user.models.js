import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true
    },
    userName : {
        type : String,
        required : true,
    },
    password : {
        type :String,
        required : true,
    },
    gender : {
        type : String,
        required : true,
        enum : ["male" , "female"],
    },
    profilePic : {
        type : String,
        default : "",
    },
    refreshToken : {
        type : String,
        default : "",
    }

} , {timestamps:true})

userSchema.pre('save' , async function(next) {
    if (! this.isModified("password")) return next();
    this.password = await bcryptjs.hash(this.password , 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcryptjs.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        userName : this.userName,
        fullName : this.fullName,
    }, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY ,
    })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
        
    }, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY ,
    })
}

export const User = mongoose.model("User" , userSchema)