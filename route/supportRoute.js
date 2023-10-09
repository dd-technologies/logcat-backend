// supportRoute.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const supportController = require('../controller/supportController.js');

// Support Routes

router.post('/create-ticket', isAuth, supportController.saveTicket);
router.get('/get-tickets',isAuth, supportController.getAllTickets);
router.delete('/delete-ticket/:id',isAuth, supportController.deleteTicket);
router.put('/update-ticket',isAuth, supportController.updateTicket);
router.get('/get-ticket/:id',isAuth, supportController.getTicketDetails);





module.exports = router;
