const fuldmagt = require("../../models/fuldmagt");
const User = require("../../models/user");
const Company = require("../../models/company");
const jwt = require("jsonwebtoken");
const { verifyCreateFuldmagt } = require("../../schemas/fuldmagt");
const Fuldmagt = require("../../models/fuldmagt");
const fuldmagtServices = require("../../services/fuldmagt.services");



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
                postImage: req.postImageUrl,
                ...req.body,
                agentPhone: {
                    countryCode: req.body.agentCountryCode,
                    number: req.body.agentNumber
                }
            }
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
    async requestFuldmagt(req, res, next){

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

            let fuldmagts  = await Fuldmagt.find({
                $or: [
                    { fuldmagtGiverId: userId },
                    { agentId: userId }
                  ]
            })

            return res.status(200).send({
                "success": true,
                "data": [
                    fuldmagts
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

module.exports = fuldmagtController