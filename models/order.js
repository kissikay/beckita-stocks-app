import mongoose, { Schema, model } from "mongoose";
const orderSchema = new Schema({

    id:{
        type:String,
        required:true
    },

    date:{
        type:Date,
        required:true
    },

    items:[{
        productId: { type: mongoose.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        unitCost: { type: Number, required: true }
    }],

    totalPrice:{
        type:Number,
        required:true,
        default:0.00
    },

    totalProfit:{
        type:Number,
        required:true,
        default:0.00
    },

    soldBy: {
        type: mongoose.Types.ObjectId,
        ref: "Admin",
        required: true
    }
},
{
    timestamps:true
})
const Order= model("Order",orderSchema);
export default Order;