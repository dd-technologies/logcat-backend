// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const hospitalController = require('../controller/hospitalController');

// Hospital routes

router.post('/register-hospital', hospitalController.saveHospital)
router.get('/hospital-list/:State', hospitalController.getHospitalList);
router.get('/hospital-list', hospitalController.getHospitalList);


router.get('/get-country-list', hospitalController.getCountryList);
router.get('/get-state-list/:name', hospitalController.getStateListByCountryName);


module.exports = router;
