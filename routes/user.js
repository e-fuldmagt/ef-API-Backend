const express = require("express");
const userController = require("../controller/user");

const uploadMiddleware = require("../middleware/uploadFile");

const userRouter = express.Router();

userRouter.post("/sendOTPToEmail", userController.sendOTPToEmail);
userRouter.post("/register", userController.registerUser);

userRouter.put("/verifyEmail", userController.verifyEmail);
userRouter.put("/sendOTPToNumber", userController.sendOtpToNumber);
userRouter.put("/setPassword/:id", userController.setPassword);
userRouter.put("/login", userController.loginUser);
userRouter.put("/forgetPassword", userController.forgetPassword);

userRouter.get("/matchPassword/:id/:confirmPassword", userController.confirmPassword);

// userRouter.post("/login", userController.login);
// userRouter.put("/updateUser/:id", userController.editUser);
// userRouter.put("/changePassword/:id", userController.changePassword);
// userRouter.get("/getUsers", userController.getUsers);
// userRouter.get("/deleteUser/:id", userController.deleteUser);

module.exports = userRouter;
