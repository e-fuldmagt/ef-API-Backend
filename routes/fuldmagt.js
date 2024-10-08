const express = require("express");
const { upload, uploadFileObjectToFirebase } = require("../services/Firebase_SignStorage");
const authGuard = require("../middleware/authGuard.middleware");
const fuldmagtController = require("../controller/fuldmagt/fuldmagt");
const { decode64FilesMiddleware } = require("../middleware/decode64.middleware");

const fuldmagtRouter = express.Router();

decode64FilesMiddleware


fuldmagtRouter.post("/createFuldmagt",
    upload.fields([
        { name: 'postImage', maxCount: 1 },  // First field for the first image
        { name: 'signature', maxCount: 1 }   // Second field for the second image
    ]),
    authGuard,
    decode64FilesMiddleware(["postImage", "signature"]),
    async (req, res, next)=>{
        try{
            if(req.files["signature"] && req.files["signature"][0]){
                let signatureFileObj = req.files["signature"][0];
                req.signatureUrl = await uploadFileObjectToFirebase(signatureFileObj, req.user); 
            }
            if(req.files["postImage"] && req.files["postImage"][0]){
                let postImageFileObj = req.files["postImage"][0];
                req.postImageUrl = await uploadFileObjectToFirebase(postImageFileObj, req.user);
            }
            if(!req.files["signature"] || !req.files["signature"][0])
                throw new Error("Singature Image doesn't exist")
            next();
        }
        catch(e){
            return res.status(500).send({
                "success": false,
                "message": "An error occured while uploading images"
            })
        }
    },
    fuldmagtController.createFuldmagt
);

fuldmagtRouter.post("/requestFuldmagt",
    upload.fields([
        { name: 'postImage', maxCount: 1 },  // First field for the first image
    ]),
    authGuard,
    decode64FilesMiddleware(["postImage"]),
    async (req, res, next)=>{
        try{
            if(req.files["postImage"] && req.files["postImage"][0]){
                let postImageFileObj = req.files["postImage"][0];
                req.postImageUrl = await uploadFileObjectToFirebase(postImageFileObj, req.user);
            }
            next();
        }
        catch(e){
            return res.status(500).send({
                "success": false,
                "message": "An error occured while uploading images"
            })
        }
    },
    fuldmagtController.requestFuldmagt
);

fuldmagtRouter.post('/approveFuldmagtRequest/:id', 
    upload.fields([
        { name: 'signature', maxCount: 1 }   // Second field for the second image
    ]),
    authGuard,
    decode64FilesMiddleware(["signature"]),
    async (req, res, next)=>{
        try{
            if(req.files["signature"] && req.files["signature"][0]){
                let signatureFileObj = req.files["signature"][0];
                req.signatureUrl = await uploadFileObjectToFirebase(signatureFileObj, req.user); 
            }
            if(!req.signatureUrl)
                throw new Error("Singature Image doesn't exist")
            next();
        }
        catch(e){
            return res.status(500).send({
                "success": false,
                "message": "An error occured while uploading images"
            })
        }
    },
    fuldmagtController.approveFuldmagtRequest
)

fuldmagtRouter.put('/revokeFuldmagt/:id', authGuard, fuldmagtController.revokeFuldmagt);

fuldmagtRouter.put('/updateFuldmagt/:id', 
    upload.fields([
        { name: 'postImage', maxCount: 1 },  // First field for the first image
        { name: 'signature', maxCount: 1 }   // Second field for the second image
    ]),
    authGuard,
    decode64FilesMiddleware(["postImage", "signature"]),
    async (req, res, next)=>{
        try{
            if(req.files["signature"] && req.files["signature"][0]){
                let signatureFileObj = req.files["signature"][0];
                req.signatureUrl = await uploadFileObjectToFirebase(signatureFileObj, req.user); 
            }
            
            if(req.files["postImage"] && req.files["postImage"][0]){
                let postImageFileObj = req.files["postImage"][0];
                req.postImageUrl = await uploadFileObjectToFirebase(postImageFileObj, req.user);
            }
            next();
        }
        catch(e){
            return res.status(500).send({
                "success": false,
                "message": "An error occured while uploading images"
            })
        }
    },
    fuldmagtController.updateFuldmagt
);

fuldmagtRouter.put('/issueAgain/:id', authGuard, fuldmagtController.issueAgain);

fuldmagtRouter.get('/getSpecificFuldmagtRequest/:id', authGuard, fuldmagtController.getSpecificFuldmagtRequest);

fuldmagtRouter.get('/getUserfuldmagts', authGuard, fuldmagtController.getUserfuldmagts);

fuldmagtRouter.get('/getSpecificfuldmagt/:id', authGuard, fuldmagtController.getSpecificfuldmagt)

module.exports = fuldmagtRouter;
