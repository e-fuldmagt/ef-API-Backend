const express = require("express");
const userController = require("../controller/user/user");
const adminRouter = express.Router();



//Users//
adminRouter.post('/users', userController.createUser)

module.exports = adminRouter;