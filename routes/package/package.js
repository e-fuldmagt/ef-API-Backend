const express = require("express");

// controlers
const packageController = require("../../controller/package/send_recievePackage");

const revokeController = require("../../controller/package/revokePackage");

const packageRouter = express.Router();

// routes
packageRouter.post("/send_recieve_Package", packageController.addPackage);
packageRouter.put("/updatePackage/:id", packageController.updatePackage);
packageRouter.get("/getPackage/:id?", packageController.getPackage);
packageRouter.get("/getUserPackage/:id", packageController.getUserPackage);


packageRouter.put("/revoke/:id", revokeController.Revoke);

module.exports = packageRouter;
