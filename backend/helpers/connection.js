const mongoose=require('mongoose');

const MONGOURL="mongodb://localhost:27017/personel_management";

mongoose.connect(MONGOURL)
.then((result)=>{
    console.log("connected successfully");


})
.catch((err)=>{
    console.log("database is not connected");
})
