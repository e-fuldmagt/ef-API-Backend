const express = require("express");

// routes
const userOtpController = require("../controller/user/otp")
const userController = require("../controller/user/user");
const userSignatureController = require("../controller/user/signature")

const {upload, uploadFileToFirebase} = require("../services/Firebase_SignStorage")

const User = require('../models/user');
const authGuard = require("../middleware/authGuard.middleware");
const userRouter = express.Router();

//Sign Up//
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
userRouter.put('/refreshTokenCall', authGuard, userController.refreshTokenCall);
userRouter.delete("/deactivateAccount", authGuard, userController.deactivateAccount);
userRouter.put("/setPassword/", authGuard, userController.setPassword);
userRouter.get("/get")
// add signature
userRouter.put('/uploadSignature/', upload.single('file'), authGuard, async (req, res, next) => {
    try {
        const id = req.user; // Extract id from request parameters
        await uploadFileToFirebase(User, id)(req, res, next); // Pass id to uploadFileToFirebase function
    } catch (error) {
        console.error('Error handling file upload to Firebase:', error);
        res.status(500).send({ success: false, message: 'Failed to handle file upload' });
    }
}, userSignatureController.addSignature);
//--------------------------------------------------------------------------------------

userRouter.post("/sendOTPToEmail", userOtpController.sendOTPToEmail);
userRouter.post("/sendOTPForPin", userOtpController.sendOTPForPin);
userRouter.post("/register", userController.registerUser);
userRouter.post("/createPrivateUser", userController.createUser);

userRouter.put("/verifyEmail", userOtpController.verifyEmail);
userRouter.put("/sendOTPToNumber", userOtpController.sendOtpToNumber);

userRouter.put("/setPin/:id", userController.setPin);

userRouter.put("/resetPin", userController.reSetPin);

userRouter.get("/loginWithPin/:pin", userController.loginWithPin);
userRouter.put("/forgetPassword", userController.forgetPassword);
userRouter.put("/update/:id", userController.updateUser);

userRouter.get("/matchPassword/:id/:confirmPassword", userController.confirmPassword);


userRouter.get("/getSignature/:id", userSignatureController.getSignature);



  

// userRouter.get("/getUsers", userController.getUsers);
// userRouter.get("/deleteUser/:id", userController.deleteUser);

module.exports = userRouter;
