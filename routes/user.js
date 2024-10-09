const express = require("express");

// routes
const userOtpController = require("../controller/user/otp")
const userController = require("../controller/user/user");
const userSignatureController = require("../controller/user/signature")

const {upload, uploadFileToFirebase, uploadFileObjectToFirebase} = require("../services/Firebase_SignStorage")

const User = require('../models/user');
const authGuard = require("../middleware/authGuard.middleware");
const notificationController = require("../controller/notifications/notifications");
const { decode64FileMiddleware, decode64FilesMiddleware } = require("../middleware/decode64.middleware");
const { errorHandler } = require("../handlers/error.handlers");
const userRouter = express.Router();

//User Sign up Functionality//
userRouter.post("/sendOTP", errorHandler(userOtpController.sendOTPToCredentials));
userRouter.post("/signup/verifyOTP", errorHandler(userOtpController.verifySignupOtp));
userRouter.post("/signup/registerUser", errorHandler(userController.registerUser));
userRouter.post("/create-password", errorHandler(userController.createPassword));
userRouter.post("/login", errorHandler(userController.login));
userRouter.post("/forgot-password/verifyOTP", errorHandler(userOtpController.verifyForgotPasswordOtp));
userRouter.get("/users", errorHandler(userController.getUsers));
userRouter.post('/verifyDevicePin', errorHandler(userController.verifyDevicePin));
userRouter.post('/mobileLogin', errorHandler(userController.mobileLogin));
userRouter.get('/users/:id', errorHandler(userController.getUser));
userRouter.delete("/deactivateAccount", authGuard, errorHandler(userController.deactivateAccount));
userRouter.put('/refreshTokenCall', authGuard, errorHandler(userController.refreshTokenCall));
userRouter.put("/setPassword/", authGuard, errorHandler(userController.setPassword));
userRouter.put("/updateInfo", authGuard, errorHandler(userController.updateUser));
userRouter.put("/updateEmail", authGuard, errorHandler(userOtpController.verifyUpdateEmailOtp));
userRouter.put("/updatePhoneNumber", authGuard, errorHandler(userOtpController.verifyUpdatePhoneNumberOtp))
userRouter.post("/logout", authGuard, errorHandler(userController.logout));
userRouter.put('/uploadSignature/', upload.single('file'), authGuard, decode64FileMiddleware('file'),  async (req, res, next) => {
    try {
        const id = req.user; // Extract id from request parameters
        await uploadFileToFirebase(User, id)(req, res, next); // Pass id to uploadFileToFirebase function
    } catch (error) {
        console.error('Error handling file upload to Firebase:', error);
        res.status(500).send({ success: false, message: 'Failed to handle file upload' });
    }
}, errorHandler(userSignatureController.addSignature));
userRouter.get("/getSignature/:id", errorHandler(userSignatureController.getSignature))
userRouter.post("/verifyPassword", authGuard, errorHandler(userController.verifyPassword));
//Upload Profile Image
userRouter.put('/uploadProfileImage', 
    upload.fields([
        { name: 'profileImage', maxCount: 1 }
    ]),
    authGuard,
    decode64FilesMiddleware(["profileImage"]),
    async (req, res, next)=>{
        try{
            if(req.files["profileImage"] && req.files["profileImage"][0]){
                let profileImageObj = req.files["profileImage"][0];
                req.profileImageUrl = await uploadFileObjectToFirebase(profileImageObj, req.user); 
            }
            if(!req.files["profileImage"] || !req.files["profileImage"][0])
                throw new Error("Profile Image doesn't exist")
            next();
        }
        catch(e){
            return res.status(500).send({
                "success": false,
                "message": "An error occured while uploading images"
            })
        }
    },
    errorHandler(userController.uploadProfileImage)
);
//User Notifications//
userRouter.put("/add-notifications-token/", authGuard, errorHandler(notificationController.addNotificationToken));
userRouter.get("/notifications", authGuard, errorHandler(notificationController.getUserNotifications))
userRouter.put("/setActivityNotification", authGuard, errorHandler(notificationController.setActivityNotification))
userRouter.get("/notificationSettings", authGuard, errorHandler(notificationController.getNotificationSettings))

module.exports = userRouter;
