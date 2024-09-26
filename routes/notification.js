const express = require("express");

// routes
const userOtpController = require("../controller/user/otp")
const notificationRouter = express.Router();

//User Sign up Functionality//
notificationRouter.put("/setActivity", userOtpController.sendOTPToCredentials);
notificationRouter.get("")
module.exports = notificationRouter