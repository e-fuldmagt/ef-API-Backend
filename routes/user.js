const express = require("express");

// routes
const userOtpController = require("../controller/user/otp")
const userController = require("../controller/user/user");
const userSignatureController = require("../controller/user/signature")

const {upload, uploadFileToFirebase} = require("../services/Firebase_SignStorage")

const User = require('../models/user');
const authGuard = require("../middleware/authGuard.middleware");
const notificationController = require("../controller/notifications/notifications");
const { decode64FileMiddleware } = require("../middleware/decode64.middleware");
const userRouter = express.Router();

//User Sign up Functionality//
userRouter.post("/sendOTP", userOtpController.sendOTPToCredentials);
userRouter.post("/signup/verifyOTP", userOtpController.verifySignupOtp);
userRouter.post("/signup/registerUser", userController.registerUser);
userRouter.post("/create-password", userController.createPassword);
userRouter.post("/login", userController.login);
userRouter.post("/forgot-password/verifyOTP", userOtpController.verifyForgotPasswordOtp);
userRouter.get("/users", userController.getUsers);
userRouter.post('/verifyDevicePin', userController.verifyDevicePin);
userRouter.post('/mobileLogin', userController.mobileLogin);
userRouter.get('/users/:id', userController.getUser);
userRouter.delete("/deactivateAccount", authGuard, userController.deactivateAccount);
userRouter.put('/refreshTokenCall', authGuard, userController.refreshTokenCall);
userRouter.put("/setPassword/", authGuard, userController.setPassword);
userRouter.put("/updateInfo", authGuard, userController.updateUser);
userRouter.put("/updateEmail", authGuard, userOtpController.verifyUpdateEmailOtp);
userRouter.put("/updatePhoneNumber", authGuard, userOtpController.verifyUpdatePhoneNumberOtp)
userRouter.put('/uploadSignature/', upload.single('file'), authGuard, decode64FileMiddleware('file'),  async (req, res, next) => {
    try {
        const id = req.user; // Extract id from request parameters
        await uploadFileToFirebase(User, id)(req, res, next); // Pass id to uploadFileToFirebase function
    } catch (error) {
        console.error('Error handling file upload to Firebase:', error);
        res.status(500).send({ success: false, message: 'Failed to handle file upload' });
    }
}, userSignatureController.addSignature);

//User Notifications//
userRouter.put("/add-notifications-token/", authGuard, notificationController.addNotificationToken);
userRouter.get("/notifications", authGuard, notificationController.getUserNotifications)
userRouter.get("/getSignature/:id", userSignatureController.getSignature)



module.exports = userRouter;
