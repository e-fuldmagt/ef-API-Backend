const express = require("express");

// controlers
const notificationController = require("../controller/notifications/pushNotification");

const notificationRouter = express.Router();

// routes
notificationRouter.get("/", notificationController.getFcmToken);





module.exports = notificationRouter;
