const express = require("express");
const Package = require('../../models/package')

// controlers
const packageController = require("../../controller/package/signPackage");

// middleware
const {upload, uploadFileToFirebase} = require("../../services/Firebase_SignStorage")

const packageRouter = express.Router();


// add signature route
packageRouter.put('/:id', upload.single('file'), async (req, res, next) => {
    try {
        const id = req.params.id; // Extract id from request parameters
        await uploadFileToFirebase(Package, id)(req, res, next); // Pass id to uploadFileToFirebase function
    } catch (error) {
        console.error('Error handling file upload to Firebase:', error);
        res.status(500).send({ success: false, message: 'Failed to handle file upload' });
    }
}, packageController.addSignature);



module.exports = packageRouter;
