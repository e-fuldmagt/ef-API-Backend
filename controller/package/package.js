const Package = require("../../models/package");
const User = require("../../models/user");
const Company = require("../../models/company");
const { verifyAddPackageSchema } = require("../../schemas/package");
const jwt = require("jsonwebtoken");

const packageController = {
    async addPackage(req, res, next){
        try{
            let validate = verifyAddPackageSchema.validate(req.body);
            
            if(validate.error){
                return res.status(400).send({
                "success": true,
                "message": validate.error.message
                })
            }
            let packageData = {
                signature: req.signatureUrl,
                postImage: req.postImageUrl,
                ...req.body,
                receiverPhone: {
                    countryCode: req.body.receiverCountryCode,
                    number: req.body.receiverNumber
                }
            }
            let receiverId = req.body.receiverId;
            if(receiverId){
                let receiver = await User.findById(receiverId);

                if(!receiver){
                    return res.status(404).send({
                        "success": false,
                        "message": "Receiver not found by given Id"
                    })
                }

                console.log(receiver);
                packageData.receiverName = receiver.name.firstName + " " + receiver.name.lastName;
                packageData.receiverPhone = receiver.phone,
                packageData.receiverDOB = receiver.dateOfBirth,
                packageData.receiverEmail = receiver.email
            }

            if(packageData.accountType == "user"){
                packageData.senderId = req.user;
            }else if(packageData.accountType == "company"){
                if(!req.company)
                    return res.status(400).send({
                        success: false,
                        message: "Company is not registered on user"
                    })
                packageData.senderId = req.company;
            }
            
            let package = new Package(packageData);

            await package.save();

            return res.status(200).send({
                success: true,
                message: "Package has been added successfully",
                data: {
                    package: package
                }
            })
        }
        catch(err){
            return res.status(500).send({
                success: false,
                message: err.message
            });
        }
    },
    async revokePackage(req, res, next){
        try{
            //Making a Body for Package Body//
            let packageId = req.params.id;
            let packageData = {
                ...req.body
            }
            if(req.signatureUrl){
                packageData.signature = req.signatureUrl;
            }
            if(req.postImageUrl){
                packageData.postImage = req.postImageUrl;
            }
            if(req.body.receiverCountryCode && req.body.receiverNumber){
                packageData.phone = {
                    countryCode: req.body.receiverCountryCode,
                    number: req.body.receiverNumber
                }
            }
            
            packageData.revoked = true;
            packageData.revokedDate = new Date();
            packageData.acknowledged = false;
            packageData.acknowledgedDate = null;
            //If we have Receiver Id, then Fetch Receiver Data//
            let receiverId = req.body.receiverId;
            if(receiverId){
                let receiver = await User.findById(receiverId);

                if(!receiver){
                    return res.status(404).send({
                        "success": false,
                        "message": "Receiver not found by given Id"
                    })
                }

                packageData.receiverName = receiver.name.firstName + " " + receiver.name.lastName;
                packageData.receiverPhone = receiver.phone,
                packageData.receiverDOB = receiver.dateOfBirth,
                packageData.receiverEmail = receiver.email
            }

            //Account Type Check//
            if(packageData.accountType == "user"){
                packageData.senderId = req.user;
            }else if(packageData.accountType == "company"){
                if(!req.company)
                    return res.status(400).send({
                        success: false,
                        message: "Company is not registered on user"
                    })
                packageData.senderId = req.company;
            }
            //Check if Package belongs to user or not//
            let package = await Package.findById(packageId);
            if(!package){
                return res.status(404).send({
                    "success": false,
                    "message": "Package with given id doesn't exist"
                })
            }
            if(package.senderId != req.user && package.senderId != req.company){
                return res.status(401).send({
                    "success": false,
                    "message": "You don't have access to given package"
                })
            }
            let updatedPackage = await Package.findByIdAndUpdate(packageId, packageData, {new: true})
            
            let packageToken = jwt.sign({packageId: updatedPackage._id}, process.env.PACKAGE_TOKEN)
            
            return res.status(200).send({
                success: true,
                message: "Package has been revoked successfully",
                data: {
                    package: updatedPackage
                }
            })
        }
        catch(err){
            return res.status(500).send({
                success: false,
                message: err.message
            });
        }
    },
    async acknowledgePackageByToken(req, res, next){
        try{
            let {packageToken} = req.query;
            let packageDetails = jwt.verify(packageToken, process.env.PACKAGE_TOKEN);

            let packageId = packageDetails.packageId;

            let package = await Package.findById(packageId);

            if(new Date() > package.expiry){
                return res.status(400).send({
                    success:false,
                    message: "Package cannot be acknowledged as it has exceeded expiry date"
                })
            }

            if(package.acknowledged){
                return res.status(409).send({
                    success: false,
                    message: "Package has already been acknowledged"
                });
            }

            package.acknowledged = true;
            package.acknowledgedDate = new Date();

            await package.save();

            return res.status(200).send({
                "success": true,
                "message": "Package has been acknowledged successfully",
                "data": {
                    package
                }
            });

        }
        catch(err){
            return res.status(500).send({
                success: false,
                message: err.message
            });
        }
    },
    async acknowledgePackageById(req, res, next){
        try{
            let packageId = req.params.id;

            let package = await Package.findById(packageId);

            if(new Date() > package.expiry){
                return res.status(400).send({
                    success:false,
                    message: "Package cannot be acknowledged as it has exceeded expiry date"
                })
            }

            if(package.acknowledged){
                return res.status(409).send({
                    success: false,
                    message: "Package has already been acknowledged"
                });
            }

            if(req.user != package.receiverId){
                return res.status(401).send({
                    success:false,
                    message: "You don't have access to this package"
                })
            }

            package.acknowledged = true;
            package.acknowledgedDate = new Date();

            await package.save();

            return res.status(200).send({
                "success": true,
                "message": "Package has been acknowledged successfully",
                "data": {
                    package
                }
            });

        }
        catch(err){
            return res.status(500).send({
                success: false,
                message: err.message
            });
        }
    },
    async getSpecificPackage(req, res, next){
        try{
            let userId = req.user;
            let packageId = req.params.id;

            let package = await Package.findById(packageId);

            if(!package){
                return res.status(404).send({
                    "success": false,
                    "message": "Package doesn't exist with given Id"
                })
            }

            if(package.senderId != userId && package.receiverId != userId){
                return res.status(401).send({
                    "success": false,
                    "message": "You don't have access to this package"
                })
            }

            return res.status(200).send({
                "success": false,
                "data": {
                    package
                }
            })
        }
        catch(err){
            return res.status(500).send({
                success: false,
                message: err.message
            });
        }
    },
    async getUserPackages(req, res, next){
        try{
            let userId = req.user;

            let packages  = await Package.find({
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                  ]
            })

            return res.status(200).send({
                "success": true,
                "data": [
                    packages
                ]
            })
        }
        catch(err){
            return res.status(500).send({
                success: false,
                message: err.message
            });
        }
    }
}

module.exports = packageController