const fuldmagt = require("../../models/fuldmagt");
const User = require("../../models/user");
const Company = require("../../models/company");
const jwt = require("jsonwebtoken");
const { verifyCreateFuldmagt, verifyRequestFuldmagt } = require("../../schemas/fuldmagt");
const Fuldmagt = require("../../models/fuldmagt");
const fuldmagtServices = require("../../services/fuldmagt.services");
const mongoose = require("mongoose");
const FuldmagtRequest = require("../../models/fuldmagtRequests");



const fuldmagtController = {
    async createFuldmagt(req, res, next){
        try{
            let validate = verifyCreateFuldmagt.validate(req.body);
            
            if(validate.error){
                return res.status(400).send({
                "success": true,
                "message": validate.error.message
                })
            }
            let fuldmagtData = {
                signature: req.signatureUrl,
                ...req.body,
                agentPhone: {
                    countryCode: req.body.agentCountryCode,
                    number: req.body.agentPhoneNumber
                }
            }
            if(fuldmagtData.postImage)
                fuldmagtData.postImage = req.postImageUrl;
            let agentId = req.body.agentId;
            let agent = null;
            if(agentId){
                agent = await User.findById(agentId);

                if(!agent){
                    return res.status(404).send({
                        "success": false,
                        "message": "agent not found by given Id"
                    })
                }

                console.log(agent);
                fuldmagtData.agentName = agent.name.firstName + " " + agent.name.lastName;
                fuldmagtData.agentPhone = agent.phone,
                fuldmagtData.agentDOB = agent.dateOfBirth,
                fuldmagtData.agentEmail = agent.email
            }

            let fuldmagtGiver = await User.findById(req.user);

            if(fuldmagtData.accountType == "user"){
                fuldmagtData.fuldmagtGiverId = fuldmagtGiver._id;
                fuldmagtData.fuldmagtGiverName = fuldmagtGiver.name.firstName + " " + fuldmagtGiver.name.lastName
            }else if(fuldmagtData.accountType == "company"){
                if(!req.company)
                    return res.status(400).send({
                        success: false,
                        message: "Company is not registered on user"
                    })
                
                let company = await Company.findById(req.company);
                fuldmagtData.fuldmagtGiverId = company._id;
                fuldmagtData.fuldmagtGiverName = company.companyName;
            }
            
            let fuldmagt = new Fuldmagt(fuldmagtData);

            await fuldmagt.save();

            fuldmagtServices.notifyFuldmagtCreation(fuldmagt, agent)

            return res.status(200).send({
                success: true,
                message: "fuldmagt has been added successfully",
                data: {
                    fuldmagt: fuldmagt
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

    async approveFuldmagtRequest(req, res, next){
        try{
            let fuldmagtRequestId = req.params.id;

            let fuldmagtRequest = await FuldmagtRequest.findById(fuldmagtRequestId);

            if(!fuldmagtRequest)
                return res.status(404).send({
                    success:false,
                    message: "fuldmagt request not found with given id"
                });

            if(fuldmagtRequest.fuldmagtGiverId != req.user && fuldmagtRequest.fuldmagtGiverId != req.company){
                return res.status(401).send({
                    success: false,
                    message: "you don't have access to this fuldmagt"
                })
            }

            let fuldmagtData = {
                title: fuldmagtRequest.title,
                postImage: fuldmagtRequest.postImage,
                accountType: fuldmagtRequest.fuldmagtGiverId == req.user? "user" : "company",
                fuldmagtGiverId: fuldmagtGiverId,
                fuldmagtGiverName: fuldmagtGiverName,
                agentId: agentId,
                agentName: agentName,
                agentDOB: agentDOB,
                agentEmail:agentEmail,
                agentPhone: agentPhone,
                signature: req.signatureUrl
            }

            let fuldmagt = new Fuldmagt(fuldmagtData);
            
            await fuldmagt.save();
            await fuldmagtRequest.delete();

            return res.status(400).send({
                success:true,
                message: "Fuldmagt has been created successfully",
                data: {
                    fuldmagt
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

    async requestFuldmagt(req, res, next){
        try{
            let validate = verifyRequestFuldmagt.validate(req.body);
            
            if(validate.error){
                return res.status(400).send({
                "success": true,
                "message": validate.error.message
                })
            }
            let fuldmagtData = {
                ...req.body,
                fuldmagtGiverPhone: {
                    countryCode: req.body.fuldmagtGiverCountryCode,
                    number: req.body.fuldmagtGiverPhoneNumber
                }
            }
            if(req.postImageUrl)
                fuldmagtData.postImage = req.postImageUrl;
            let fuldmagtGiverId = req.body.fuldmagtGiverId;
            let fuldmagtGiver = null;
            if(fuldmagtGiverId){
                fuldmagtGiver = await User.findById(fuldmagtGiverId);
                console.log(fuldmagtGiver);
                if(!fuldmagtGiver){
                    return res.status(404).send({
                        "success": false,
                        "message": "Fuldmagt Giver not found by given Id"
                    })
                }

                fuldmagtData.fuldmagtGiverName = fuldmagtGiver.name.firstName + " " + fuldmagtGiver.name.lastName;
                fuldmagtData.fuldmagtGiverPhone = fuldmagtGiver.phone,
                fuldmagtData.fuldmagtGiverDOB = fuldmagtGiver.dateOfBirth,
                fuldmagtData.fuldmagtGiverEmail = fuldmagtGiver.email
            }

            let agent = await User.findById(req.user);

            if(fuldmagtData.accountType == "user"){
                fuldmagtData.agentId = agent._id;
                fuldmagtData.agentName = agent.name.firstName + " " + agent.name.lastName;
                fuldmagtData.agentDOB = agent.dateOfBirth;
                fuldmagtData.agentEmail = agent.email;
                fuldmagtData.agentPhone = agent.phone
            }
            // else if(fuldmagtData.accountType == "company"){
            //     if(!req.company)
            //         return res.status(400).send({
            //             success: false,
            //             message: "Company is not registered on user"
            //         })
                
            //     let company = await Company.findById(req.company);
            //     fuldmagtData.fuldmagtGiverId = company._id;
            //     fuldmagtData.fuldmagtGiverName = company.companyName;
            // }
            console.log(fuldmagtData);
            let fuldmagtRequest = new FuldmagtRequest(fuldmagtData);

            await fuldmagtRequest.save();

            //fuldmagtServices.notifyFuldmagtCreation(fuldmagt, agent)

            return res.status(200).send({
                success: true,
                message: "fuldmagt has been added successfully",
                data: {
                    fuldmagtRequest
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
    async revokeFuldmagt(req, res, next){
        try{
            //Making a Body for fuldmagt Body//
            let fuldmagtId = req.params.id;

            //Check if fuldmagt belongs to user or not//
            let fuldmagt = await Fuldmagt.findById(fuldmagtId);
            if(!fuldmagt){
                return res.status(404).send({
                    "success": false,
                    "message": "fuldmagt with given id doesn't exist"
                })
            }
            if(fuldmagt.fuldmagtGiverId != req.user && fuldmagt.fuldmagtGiverId != req.company){
                return res.status(401).send({
                    "success": false,
                    "message": "You don't have access to given fuldmagt"
                })
            }
            
            
            fuldmagt.revoked = true;
            fuldmagt.revokedDate = new Date();
            
            await fuldmagt.save();

            fuldmagtServices.notifyFuldmagtRevoke(fuldmagt);
            return res.status(200).send({
                success: true,
                message: "fuldmagt has been revoked successfully",
                data: {
                    fuldmagt: fuldmagt
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
    async updateFuldmagt(req, res, next){
        try{
            //Making a Body for fuldmagt Body//
            let fuldmagtId = req.params.id;
            let fuldmagtData = {
                ...req.body
            }
            if(req.signatureUrl){
                fuldmagtData.signature = req.signatureUrl;
            }
            if(req.postImageUrl){
                fuldmagtData.postImage = req.postImageUrl;
            }
            if(req.body.agentCountryCode && req.body.agentNumber){
                fuldmagtData.phone = {
                    countryCode: req.body.agentCountryCode,
                    number: req.body.agentNumber
                }
            }
            
            //As Fuldmagt is getting updated, so it won't be revoked anymore and it is also not acknowledged//
            fuldmagtData.revoked = false;
            fuldmagtData.revokedDate = null;
            fuldmagtData.acknowledged = false;
            fuldmagtData.acknowledgedDate = null;
            //If we have agent Id, then Fetch agent Data//
            let agentId = req.body.agentId;
            if(agentId){
                let agent = await User.findById(agentId);

                if(!agent){
                    return res.status(404).send({
                        "success": false,
                        "message": "agent not found by given Id"
                    })
                }

                fuldmagtData.agentName = agent.name.firstName + " " + agent.name.lastName;
                fuldmagtData.agentPhone = agent.phone,
                fuldmagtData.agentDOB = agent.dateOfBirth,
                fuldmagtData.agentEmail = agent.email
            }

            //Check if User has 
            //Account Type Check//
            let fuldmagtGiver = await User.findById(req.user);

            if(fuldmagtData.accountType == "user"){
                fuldmagtData.fuldmagtGiverId = fuldmagtGiver._id;
                fuldmagtData.fuldmagtGiverName = fuldmagtGiver.name.firstName + " " + fuldmagtGiver.name.lastName;
            }else if(fuldmagtData.accountType == "company"){
                if(!req.company)
                    return res.status(400).send({
                        success: false,
                        message: "Company is not registered on user"
                    })
                
                let company = await Company.findById(req.company);
                fuldmagtData.fuldmagtGiverId = company._id;
                fuldmagtData.fuldmagtGiverName = company.companyName;
            }
            //Check if fuldmagt belongs to user or not//
            let fuldmagt = await Fuldmagt.findById(fuldmagtId);
            if(!fuldmagt){
                return res.status(404).send({
                    "success": false,
                    "message": "fuldmagt with given id doesn't exist"
                })
            }
            
            if(fuldmagt.fuldmagtGiverId != req.user && fuldmagt.fuldmagtGiverId != req.company){
                return res.status(401).send({
                    "success": false,
                    "message": "You don't have access to given fuldmagt"
                })
            }

            let updatedfuldmagt = await Fuldmagt.findByIdAndUpdate(fuldmagtId, fuldmagtData, {new: true})
            
            let fuldmagtToken = jwt.sign({fuldmagtId: updatedfuldmagt._id}, process.env.FULDMAGT_TOKEN)
            
            console.log(fuldmagtToken);

            return res.status(200).send({
                success: true,
                message: "fuldmagt has been updated successfully",
                data: {
                    fuldmagt: updatedfuldmagt
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
    async acknowledgefuldmagtByToken(req, res, next){
        try{
            let {fuldmagtToken} = req.query;
            let fuldmagtDetails = jwt.verify(fuldmagtToken, process.env.FULDMAGT_TOKEN);

            let fuldmagtId = fuldmagtDetails.fuldmagtId;

            let fuldmagt = await Fuldmagt.findById(fuldmagtId);

            if(new Date() > fuldmagt.expiry){
                return res.status(400).send({
                    success:false,
                    message: "fuldmagt cannot be acknowledged as it has exceeded expiry date"
                })
            }

            if(fuldmagt.acknowledged){
                return res.status(409).send({
                    success: false,
                    message: "fuldmagt has already been acknowledged"
                });
            }

            fuldmagt.acknowledged = true;
            fuldmagt.acknowledgedDate = new Date();

            await fuldmagt.save();

            return res.status(200).send({
                "success": true,
                "message": "fuldmagt has been acknowledged successfully",
                "data": {
                    fuldmagt
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
    async acknowledgefuldmagtById(req, res, next){
        try{
            let fuldmagtId = req.params.id;

            let fuldmagt = await Fuldmagt.findById(fuldmagtId);

            if(new Date() > fuldmagt.expiry){
                return res.status(400).send({
                    success:false,
                    message: "fuldmagt cannot be acknowledged as it has exceeded expiry date"
                })
            }

            if(fuldmagt.acknowledged){
                return res.status(409).send({
                    success: false,
                    message: "fuldmagt has already been acknowledged"
                });
            }

            if(req.user != fuldmagt.agentId){
                return res.status(401).send({
                    success:false,
                    message: "You don't have access to this fuldmagt"
                })
            }

            fuldmagt.acknowledged = true;
            fuldmagt.acknowledgedDate = new Date();

            await fuldmagt.save();

            return res.status(200).send({
                "success": true,
                "message": "fuldmagt has been acknowledged successfully",
                "data": {
                    fuldmagt
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
    async getSpecificfuldmagt(req, res, next){
        try{
            let userId = req.user;
            let fuldmagtId = req.params.id;

            let fuldmagt = await Fuldmagt.findById(fuldmagtId);

            if(!fuldmagt){
                return res.status(404).send({
                    "success": false,
                    "message": "fuldmagt doesn't exist with given Id"
                })
            }
            console.log(fuldmagt);
            if(fuldmagt.fuldmagtGiverId != userId && fuldmagt.agentId != userId){
                return res.status(401).send({
                    "success": false,
                    "message": "You don't have access to this fuldmagt"
                })
            }

            return res.status(200).send({
                "success": false,
                "data": {
                    fuldmagt
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
    async getUserfuldmagts(req, res, next){
        try{
            let userId = req.user;
            let objectIdUserId = new mongoose.Types.ObjectId(userId);
            let orFilter = [
                { fuldmagtGiverId: objectIdUserId },
                { agentId: objectIdUserId }
            ];

            if(req.company){
                orFilter.push({fuldmagtGiverId: new mongoose.Types.ObjectId(req.company)})
            }
            let fuldmagts = await Fuldmagt.aggregate([
                {
                    $match: {
                        $or: orFilter
                    }
                },
                {
                    $addFields: {
                        validity: {
                            $cond: [
                                { $eq: ["$revoked", true] }, // Check if revoked is true
                                "revoked", // If true, set validity to "revoked"
                                {
                                    $cond: [
                                        { $gt: [new Date(), "$expiry"] }, // Check if current date is less than expiry
                                        "expired", // If expiry is less than the current date, set validity to "expired"
                                        "$expiry" // Otherwise, set it to the expiry date
                                    ]
                                }
                            ]
                        },
                        status: {
                            $cond:[
                                {$or: [{$eq: ["$fuldmagtGiverId", objectIdUserId]}, {$eq: ["$fuldmagtGiverId", new mongoose.Types.ObjectId(req.company)]}]},
                                "sent",
                                "received"
                            ]
                        }
                    }
                },
                { $sort: { createdAt: -1 } } // Sort by createdAt in descending order
            ]);

            let fuldmagtRequests = await FuldmagtRequest.aggregate([
                {
                    $match: {
                        $or: orFilter
                    }
                },
                {
                    $addFields: {
                        validity: "request",
                        status: {
                            $cond:[
                                {$or: [{$eq: ["$fuldmagtGiverId", objectIdUserId]}, {$eq: ["$fuldmagtGiverId", new mongoose.Types.ObjectId(req.company)]}]},
                                "received_request",
                                "sent_request"
                            ]
                        }
                    }
                },
                { $sort: { createdAt: -1 } } // Sort by createdAt in descending order
            ]);

            let allFuldmagts = [...fuldmagts, ...fuldmagtRequests]

            return res.status(200).send({
                "success": true,
                "data": {
                    fuldmagts: allFuldmagts
                }
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

module.exports = fuldmagtController