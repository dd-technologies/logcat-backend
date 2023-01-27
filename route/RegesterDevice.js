const express = require("express");
const { body } = require('express-validator');
const router = express.Router();
const { registerDevice 
} = require("../controller/RegisterDevice");



router.post('/RegisterDevice',
    body('DeviceId').notEmpty(),
    body('IMEI_NO').notEmpty(),
    body('Hospital_Name').notEmpty(),
    body('Ward_No').notEmpty(),
    body('Ventilator_Operator').notEmpty(),
    body('Doctor_Name').notEmpty(),
    registerDevice)

module.exports = router; 