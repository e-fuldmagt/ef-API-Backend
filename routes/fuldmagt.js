const express = require("express");
// controlers
const fuldmagtController = require("../controller/fuldmagt/fuldmagtForm");

// middleware
const {upload, uploadFileToFirebaseWithoutDeletingPrevious} = require("../services/Firebase_SignStorage")

const fuldmagtRouter = express.Router();

// add form route
fuldmagtRouter.post('/addForm', upload.single('file'), async (req, res, next) => {
    try {
        await uploadFileToFirebaseWithoutDeletingPrevious(req, res, next); // Pass id to uploadFileToFirebase function
    } catch (error) {
        console.error('Error handling file upload to Firebase:', error);
        res.status(500).send({ success: false, message: 'Failed to handle file upload' });
    }
}, fuldmagtController.addForm);



module.exports = fuldmagtRouter;
