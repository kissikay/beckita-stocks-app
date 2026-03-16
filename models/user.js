import mongoose, { Schema } from "mongoose";
const userSchema= new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
        required:true
    },
    pfp:{
        type:String,
        default:""
    },
    Address:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
})
const User=mongoose.model('User',userSchema);
export default User;
