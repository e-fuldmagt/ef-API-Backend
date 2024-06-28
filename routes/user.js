const express = require("express");

// routes
const userOtpController = require("../controller/user/otp")
const userController = require("../controller/user/user");
const userSignatureController = require("../controller/user/signature")

const {upload, uploadFileToFirebase} = require("../services/Firebase_SignStorage")

const User = require('../models/user')
const userRouter = express.Router();

userRouter.post("/sendOTPToEmail", userOtpController.sendOTPToEmail);
userRouter.post("/register", userController.registerUser);
userRouter.post("/createPrivateUser", userController.createUser);

userRouter.put("/verifyEmail", userOtpController.verifyEmail);
userRouter.put("/sendOTPToNumber", userOtpController.sendOtpToNumber);
userRouter.put("/setPassword/:id", userController.setPassword);

userRouter.put("/setPin/:id", userController.setPin);

userRouter.put("/resetPin", userController.reSetPin);
userRouter.put("/login", userController.loginUser);

userRouter.get("/loginWithPin/:pin", userController.loginWithPin);
userRouter.put("/forgetPassword", userController.forgetPassword);
userRouter.put("/update/:id", userController.updateUser);

userRouter.get("/matchPassword/:id/:confirmPassword", userController.confirmPassword);


userRouter.get("/getSignature/:id", userSignatureController.getSignature);
userRouter.get("/getUser/:id?", userController.getUser);

// add signature
userRouter.put('/upload/:id', upload.single('file'), async (req, res, next) => {
    try {
        const id = req.params.id; // Extract id from request parameters
        await uploadFileToFirebase(User, id)(req, res, next); // Pass id to uploadFileToFirebase function
    } catch (error) {
        console.error('Error handling file upload to Firebase:', error);
        res.status(500).send({ success: false, message: 'Failed to handle file upload' });
    }
}, userSignatureController.addSignature);

  

// userRouter.get("/getUsers", userController.getUsers);
// userRouter.get("/deleteUser/:id", userController.deleteUser);

module.exports = userRouter;
