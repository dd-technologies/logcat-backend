// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const patientController = require('../controller/patientController.js');

// Patient routes

router.post('/save-uhid-details', patientController.saveUhid);
router.get('/get-allUhid', isAuth, patientController.getAllUhid);
router.get('/get-patient-details/:UHID', isAuth, patientController.getDataByUhid);
router.get('/get-Uhids', isAuth, patientController.getAllUhids);



module.exports = router;
