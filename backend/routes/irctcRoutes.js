const express=require('express');
const router=express.Router();

const irctcControllers=require('../controllers.js/irctcControllers');

router.post('/get-emails',irctcControllers.getEmails );

router.get('/getExistedEmailData',irctcControllers.getExistedEmails)

module.exports=router;