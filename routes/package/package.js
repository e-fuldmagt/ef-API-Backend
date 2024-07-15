const express = require("express");

// controlers
const packageController = require("../../controller/package/send_recievePackage");

const packageRouter = express.Router();

// routes
packageRouter.post("/send_recieve_Package", packageController.addPackage);
packageRouter.put("/updatePackage/:id", packageController.updatePackage);
packageRouter.get("/getPackage/:id?", packageController.getPackage);
packageRouter.get("/getUserPackage/:id", packageController.getUserPackage);



module.exports = packageRouter;
