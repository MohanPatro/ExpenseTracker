const mongoose=require('mongoose');

const Schema=mongoose.Schema

const flipkartDataSchema=new Schema({
    orderId:{
        type:String
    },
    totalAmount:{
        type:String
    },
    status:{
        type:String
    }
}, { strict: false })


module.exports=mongoose.model('flipkartData',flipkartDataSchema);