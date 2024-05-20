const express = require("express");
const userController = require("../controller/user");

const uploadMiddleware = require("../middleware/uploadFile");

const userRouter = express.Router();

userRouter.post(
  "/addUser",
  uploadMiddleware.single("file"),
  userController.register
);
userRouter.post("/login", userController.login);
userRouter.put("/updateUser/:id", userController.editUser);
userRouter.put("/changePassword/:id", userController.changePassword);
userRouter.get("/getUsers", userController.getUsers);
userRouter.get("/deleteUser/:id", userController.deleteUser);

module.exports = userRouter;
