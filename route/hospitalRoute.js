// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth, isAdmin, isDispatch } = require("../middleware/authMiddleware.js");
const hospitalController = require('../controller/hospitalController');

// Hospital routes

router.post('/register-hospital', isAuth, isAdmin, hospitalController.saveHospital)
router.get('/hospital-list/:State', hospitalController.getHospitalList);
router.get('/hospital-list', hospitalController.getHospitalList);
router.get('/get-byid/:id', hospitalController.getSingleHospital);
router.put('/update-hospital', isAuth, isAdmin, hospitalController.updateHospital);
router.delete('/delete-byid/:id', isAuth, isAdmin, hospitalController.deleteHospital);




router.get('/get-country-list', hospitalController.getCountryList);
router.get('/get-state-list/:name', hospitalController.getStateListByCountryName);


module.exports = router;
