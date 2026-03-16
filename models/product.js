import { Schema, model } from "mongoose";
const productSchema= new Schema({
    id:{
        type:String,
        required:false,
        default:''
    },
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    costPrice:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    minStockLevel:{
        type:Number,
        default:5
    }
});
const Product=model("Product",productSchema);
export default Product;