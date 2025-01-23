const express=require('express');
const router=express.Router();

const flipkartControllers=require('../controllers.js/flipkartControllers')


router.post('/api/flipkartEmails',flipkartControllers.getAllFlipkartEmailData)

router.get('/getFlipkartEmailData',flipkartControllers.getAllFlipkartEmailData);

module.exports=router;