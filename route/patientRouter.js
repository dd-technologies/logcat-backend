// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const patientController = require('../controller/patientController');

// Patient routes

router.post('/register-patient', isAuth, patientController.addNewPatient);
router.get('/patient-list', isAuth, patientController.getAllPatient);


module.exports = router;
