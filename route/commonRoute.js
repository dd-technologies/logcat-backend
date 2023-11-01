const express = require('express');
const router = express.Router();
const { isAuth, isAdmin, isDispatch } = require("../middleware/authMiddleware.js");
const commonController = require("../controller/commonController.js");


// common routes
router.post("/send-verification-email", commonController.sendVerificationEmail);
router.post("/verify-otp", commonController.verifyOtp);
router.get("/search-by-pincode/:pincode", commonController.getCountryByPincode);



module.exports = router;