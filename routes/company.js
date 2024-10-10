const express = require("express");
const Company = require('../models/company')

// controlers
const companyController = require("../controller/company.controllers");

// middleware
const {upload, uploadFileToFirebase} = require("../services/Firebase_SignStorage");
const authGuard = require("../middleware/authGuard.middleware");
const { decode64FileMiddleware } = require("../middleware/decode64.middleware");
const { errorHandler } = require("../handlers/error.handlers");

const companyRouter = express.Router();

// routes
companyRouter.post("/verifyCompanyCredentials", 
    authGuard, 
    errorHandler(companyController.verifyCompanyCredentials));
companyRouter.post("/register", 
    authGuard, 
    errorHandler(companyController.addCompanyByUser));
companyRouter.post("/registerUnverified", 
    authGuard, 
    errorHandler(companyController.addCompanyUnverified));
companyRouter.put("/assignCompany/:id", 
    authGuard, 
    errorHandler(companyController.assignCompany));

companyRouter.get("/getCompany/:id", 
    errorHandler(companyController.getSpecificCompany));

companyRouter.put("/update", 
    authGuard, 
    errorHandler(companyController.updateCompanyByUser));
companyRouter.get("/getSignature/:id", 
    errorHandler(companyController.getCompanySignature));
companyRouter.get("/getCompanies", 
    errorHandler(companyController.getCompanies));
// add signature route
companyRouter.put('/uploadSignature/', 
    upload.single('file'), 
    decode64FileMiddleware('file'), 
    authGuard, 
    async (req, res, next) => {
    try {
        const id = req.company; // Extract id from request parameters
            await uploadFileToFirebase(Company, id)(req, res, next); // Pass id to uploadFileToFirebase function
        } catch (error) {
            console.error('Error handling file upload to Firebase:', error);
            res.status(500).send({ success: false, message: 'Failed to handle file upload' });
        }
    }, 
    errorHandler(companyController.updateCompanySignature)
);



module.exports = companyRouter;
