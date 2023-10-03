// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const productionController = require("../controller/productionController.js");

// Production routes

router.post('/add-new', isAuth, productionController.createProduction);
router.get('/production-list', isAuth, productionController.getProductionData);


module.exports = router;
