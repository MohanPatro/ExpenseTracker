const express=require('express');
const router=express.Router();

const commonControllers=require('../controllers.js/commonControllers');

  
router.post('/exchange-code',commonControllers.exchangeCode);
  
  
  
router.post('/refresh-token',commonControllers.refresToken );

module.exports=router;