const express = require("express");
const { body } = require('express-validator');
const router = express.Router();
// const {
//     isAuth
// } = require('../middleware/authMiddleware');
const { registerDevice, getAllRegisteredDevice 
} = require("../controller/RegisterDevice");




router.post('/RegisterDevice',
    body('did').notEmpty(),
    body('IMEI_NO').notEmpty(),
    body('Hospital_Name').notEmpty(),
    body('Ward_No').notEmpty(),
    body('Ventilator_Operator').notEmpty(),
    body('Doctor_Name').notEmpty(),
    registerDevice);
router.get('/',getAllRegisteredDevice)    

module.exports = router; 