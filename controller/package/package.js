const Package = require("../../models/package");
const User = require("../../models/user");
const Company = require("../../models/company");
const { verifyAddPackageSchema } = require("../../schemas/package");

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
                data: { error: err.message },
            });
        }
    },
    async revokePackage(req, res, next){
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
                data: { error: err.message },
            });
        }
    },
    async acknowledgePackage(req, res, next){

    }
}

module.exports = packageController