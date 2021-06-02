const express = require('express');
const router = express.Router();
const chatController = require('./../controllers/chatController');
const authController = require('./../controllers/authController');

router.post("/room/new",authController.protect,chatController.addRoom);

module.exports = router;