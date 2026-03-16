import mongoose, { Schema,Types } from "mongoose";
const adminSchema=new Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["super_admin","admin"],
        default:"admin"
    },
    status:{
        type:String,
        enum:["pending","approved"],
        default:"pending"
    },
    profileImage: {
        type: String,
        default: ""
    }
}, { timestamps: true })
const Admin = mongoose.model("Admin",adminSchema);
export default Admin;