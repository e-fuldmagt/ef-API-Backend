const express = require("express");
const userController = require("../controller/user/user");
const adminRouter = express.Router();



//Users//
adminRouter.post('/users', userController.createUser)
adminRouter.delete('/users/:id', userController.deleteUser);
module.exports = adminRouter;