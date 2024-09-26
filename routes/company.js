const express = require("express");
const Company = require('../models/company')

// controlers
const companyController = require("../controller/company/company");
const companySignatureController = require("../controller/company/signatures");

// middleware
const {upload, uploadFileToFirebase} = require("../services/Firebase_SignStorage");
const authGuard = require("../middleware/authGuard.middleware");
const { decode64FileMiddleware } = require("../middleware/decode64.middleware");

const companyRouter = express.Router();

// routes
companyRouter.post("/verifyCompanyCredentials", authGuard, companyController.verifyCompanyCredentials);
companyRouter.post("/register", authGuard, companyController.addCompany);
companyRouter.post("/registerUnverified", authGuard, companyController.addCompanyUnverified);
companyRouter.put("/assignCompany/:id", authGuard, companyController.assignCompany);

companyRouter.get("/getCompany/:id", companyController.getSpecificCompany);

companyRouter.put("/update", authGuard, companyController.updateCompany);
companyRouter.get("/getSignature/:id", companySignatureController.getSignature);
companyRouter.get("/getCompanies", companyController.getCompanies);
// add signature route
companyRouter.put('/uploadSignature/', upload.single('file'), decode64FileMiddleware('file'), authGuard, async (req, res, next) => {
    try {
        const id = req.company; // Extract id from request parameters
        await uploadFileToFirebase(Company, id)(req, res, next); // Pass id to uploadFileToFirebase function
    } catch (error) {
        console.error('Error handling file upload to Firebase:', error);
        res.status(500).send({ success: false, message: 'Failed to handle file upload' });
    }
}, companySignatureController.addSignature);



module.exports = companyRouter;
