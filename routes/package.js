const express = require("express");
const { upload, uploadFileObjectToFirebase } = require("../services/Firebase_SignStorage");
const authGuard = require("../middleware/authGuard.middleware");
const packageController = require("../controller/package/package");

const packageRouter = express.Router();

//User Sign up Functionality//
packageRouter.post("/addPackage", 
    upload.fields([
        { name: 'postImage', maxCount: 1 },  // First field for the first image
        { name: 'signature', maxCount: 1 }   // Second field for the second image
    ]),
    authGuard,
    async (req, res, next)=>{
        try{
            let signatureFileObj = req.files["signature"][0];
            let postImageFileObj = req.files["postImage"][0];
            let signatureUrl = await uploadFileObjectToFirebase(signatureFileObj, req.user);
            let postImageUrl = await uploadFileObjectToFirebase(postImageFileObj, req.user);

            req.signatureUrl = signatureUrl
            req.postImageUrl = postImageUrl
            if(req.signatureUrl && req.postImageUrl)
                next();
            else
                throw new Error("Images cannot be processed")
        }
        catch(e){
            return res.status(500).send({
                "success": false,
                "message": "An error occured while uploading images"
            })
        }
    },
    packageController.addPackage
);

packageRouter.put('/revokePackage/:id', 
    upload.fields([
        { name: 'postImage', maxCount: 1 },  // First field for the first image
        { name: 'signature', maxCount: 1 }   // Second field for the second image
    ]),
    authGuard,
    async (req, res, next)=>{
        try{
            if(req.files["signature"] && req.files["signature"][0]){
                let signatureFileObj = req.files["signature"][0];
                req.signatureUrl = await uploadFileObjectToFirebase(signatureFileObj, req.user); 
            }
            else if(req.files["postImage"] && req.files["postImage"][0]){
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
    packageController.revokePackage
);

packageRouter.get('/acknowledgeByToken', packageController.acknowledgePackageByToken);

packageRouter.put('/acknowledge/:id', authGuard, packageController.acknowledgePackageById);

packageRouter.get('/getUserPackages', authGuard, packageController.getUserPackages);

packageRouter.get('/getSpecificPackage/:id', authGuard, packageController.getSpecificPackage)

module.exports = packageRouter;
