// supportRoute.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const supportController = require('../controller/supportController.js');
const upload = require('../helper/upload.helper');
const uploadController = require('../controller/upload.controller');


// Support Routes

router.post('/create-ticket', isAuth, supportController.saveTicket);
router.get('/get-tickets',isAuth, supportController.getAllTickets);
router.delete('/delete-ticket/:id',isAuth, supportController.deleteTicket);
router.put('/update-ticket',isAuth, supportController.updateTicket);
router.get('/get-ticket/:id',isAuth, supportController.getTicketDetails);
router.post('/add-installation-record', supportController.addInstallationRecord);
// router.post('/upload-installation-report',  supportController.addInstallationReport);


router.post('/upload-installation-report/:deviceId/:flag', upload.single('file'), uploadController.uploadInstallationReport);
router.delete('/delete-installation-report/:key', isAuth, uploadController.deleteInstallationRecord);






module.exports = router;
