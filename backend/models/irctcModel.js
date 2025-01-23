const mongoose=require('mongoose');

const Schema=mongoose.Schema

const irctcDataSchema=new Schema({
    PNR:{
        type:Number
    },
    Amount:{
        type:Number
    },
    status:{
        type:Number
    }
}, { strict: false })


module.exports=mongoose.model('irctcData',irctcDataSchema);