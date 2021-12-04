const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

router.get('/me',authController.protect,userController.getMe);

module.exports = router;