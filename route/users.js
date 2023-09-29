const express = require("express");
const { body } = require('express-validator');
const verifyUserOrAdmin = require('../middleware/verifyUserOrAdmin.js');
const router = express.Router();

const {
    registerUser,
    loginUser,
    updateUserProfile,
    logoutUser,
    // userForgetPassword,
    resetForgetPassword,
    verifyOtp,
    generateNewPassword,
    userPasswordChange,
    getUserByUserId,
    getUserProfileById,
    getAllUsers,
    changeUserType,
    getActivity,
} = require('../controller/users.js')

const {
    isAuth, isAdmin
} = require('../middleware/authMiddleware');
const { profileCache } = require("../middleware/cache.js");

// AUTH Route 
// Unprotected
router.post('/auth/login', loginUser);
router.post('/auth/register', registerUser);
// router.post("/auth/forget", body('email').notEmpty().isEmail(), userForgetPassword);

// Token access
router.post("/auth/resetPassword", resetForgetPassword)
router.post("/auth/verify-otp", verifyOtp);
router.put("/auth/generate-newpassword", generateNewPassword);
// router.post("/auth/resetPassword",
//     body('otp').notEmpty(),
//     body('email').notEmpty().isEmail(),
//     body('password').notEmpty().trim().escape(),
//     body('passwordVerify').notEmpty().trim().escape(),
//     resetForgetPassword);

// Protected
router.get('/auth/logout', isAuth, logoutUser)

// USERS Route
// Protected Route
// router.get('/users', isAuth, profileCache(10), getUserByUserId)
router.get('/users/:userId', isAuth, getUserProfileById);
router.get('/users-list', isAuth, isAdmin, getAllUsers);
router.put('/change-userType/:userId', isAuth, isAdmin, changeUserType);
router.put('/users/update', isAuth, updateUserProfile);
router.put("/users/changepassword", isAuth, userPasswordChange);
router.get("/user-activity", isAuth, getActivity);

module.exports = router;
