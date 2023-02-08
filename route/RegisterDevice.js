const express = require("express");
const { body } = require('express-validator');
const router = express.Router();
// const {
//     isAuth
// } = require('../middleware/authMiddleware');
const { registerDevice, getAllRegisteredDevice, getRegisterDeviceById 
} = require("../controller/RegisterDevice");




router.patch('/RegisterDevice',
    body('DeviceId').notEmpty(),
    body('IMEI_NO').notEmpty(),
    body('Hospital_Name').notEmpty(),
    body('Ward_No').notEmpty(),
    body('Ventilator_Operator').notEmpty(),
    body('Doctor_Name').notEmpty(),
    registerDevice);
router.get('/',getAllRegisteredDevice) 
router.get('/DeviceById/:did',getRegisterDeviceById)   

module.exports = router; 