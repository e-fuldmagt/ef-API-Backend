const jwt = require("jsonwebtoken")
const notificationServices = require("./notification.services")
const { sendEmail } = require("./MailService")
const mongoose = require("mongoose")
const NotificationSetting = require("../models/notificationSettings")
const User = require("../models/user")
const Fuldmagt = require("../models/fuldmagt")
const Company = require("../models/company")
const fuldmagtFormRepository = require("../repositories/fuldmagtForm.repositories")
const createHttpError = require("http-errors")

const revokedFuldmagtEmailTemplate = (fuldmagt)=>{
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Revocation of E-Fuldmagt</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            padding: 12px 24px;
            background-color: #dc3545;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .button:hover {
            background-color: #c82333;
        }
        .footer {
            font-size: 14px;
            color: #888888;
            margin-top: 20px;
        }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="header">Revocation of E-Fuldmagt</div>
        <div class="content">
            <p>Dear ${fuldmagt.agentName},</p>
            <p>
            We are writing to inform you that the E-Fuldmagt (digital power of attorney) previously granted to you has been revoked as of ${fuldmagt.revokedDate}.
            </p>
            <p>
            This means that the power of attorney is no longer valid, and you no longer has the authority to act on ${fuldmagt.fuldmagtGiverName} behalf for the following matters:
            </p>

            <ul>
            <li><strong>Authorized Actions:</strong> Package Collection </li>
            <li><strong>Date of Revocation:</strong> ${fuldmagt.revokedDate}</li>
            </ul>

            <p>
            As a result, the Fuldmagt document is no longer accessible. If you need further assistance or have any questions, please feel free to contact us.
            </p>

            <div class="button-container">
            <a href="#" class="button" style="pointer-events: none;">Access Revoked</a>
            </div>

            <p>
            Thank you for your attention to this matter.
            </p>
        </div>

        <div class="footer">
            Best regards,<br />
            e-Fuldmagt (digital Power of Attorney)
        </div>
        </div>
    </body>
    </html>`
}

const createFuldmagtEmailTemplate = (fuldmagt)=>{
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>E-Fuldmagt Notification</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            font-size: 14px;
            color: #888888;
            margin-top: 20px;
        }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="header">Notification of Signed E-Fuldmagt</div>
        <div class="content">
            <p>Dear ${fuldmagt.agentName},</p>
            <p>
            We are writing to inform you that the E-Fuldmagt (digital power of
            attorney) has been successfully signed and completed as of ${fuldmagt.createdAt}.
            </p>
            <p>This document grants authority to  ${fuldmagt.agentName} to act on behalf of ${fuldmagt.fuldmagtGiverName} for the following matters:</p>

            <ul>
            <li><strong>Fuldmagt Title:</strong> ${fuldmagt.title}</li>
            <li><strong>Authorized Actions:</strong> Package Collection </li>
            <li><strong>Date of Signature:</strong> ${fuldmagt.createdAt}</li>
            </ul>

            <p>
            If you have any questions or require further information, please do
            not hesitate to contact us. You can access the signed document via the
            button below.
            </p>

            <div class="button-container">
            <a href="[Link to Document]" class="button">View Fuldmagt</a>
            </div>

            <p>Thank you for your attention to this matter.</p>
        </div>

        <div class="footer">
            Best regards,<br />
            e-Fuldmagt (digital Power of Attorney)
        </div>
        </div>
    </body>
    </html>
    `
}

const createFuldmagtRequestTemplate = (fuldmagtRequest) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>E-Fuldmagt Request</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            font-size: 14px;
            color: #888888;
            margin-top: 20px;
        }
        </style>
    </head>
    <body>
        <div class="container">
        <div class="header">Request for E-Fuldmagt</div>
        <div class="content">
            <p>Dear ${fuldmagtRequest.fuldmagtGiverName},</p>
            <p>
            You have received a request to sign a digital power of attorney (E-Fuldmagt)
            granting authority to ${fuldmagtRequest.agentName} to act on your behalf for the following matters:
            </p>

            <ul>
            <li><strong>Fuldmagt Title:</strong> ${fuldmagtRequest.title}</li>
            <li><strong>Authorized Actions:</strong> Package Collection</li>
            <li><strong>Date of Request:</strong> ${fuldmagtRequest.createdAt}</li>
            </ul>

            <p>
            To review the details and sign the E-Fuldmagt, please click on the button below.
            </p>

            <div class="button-container">
            <a href="[Link to Sign Fuldmagt]" class="button">Sign Fuldmagt</a>
            </div>

            <p>
            If you have any questions or need further information, feel free to contact us.
            </p>
        </div>

        <div class="footer">
            Best regards,<br />
            e-Fuldmagt (digital Power of Attorney)
        </div>
        </div>
    </body>
    </html>
    `;
};

const fuldmagtServices = {
    async createFuldmagt(userId, fuldmagtData){
        
        //Setting Up Agent//
        let agentId = fuldmagtData.agentId;
        let agent = null;
        if(agentId){
            agent = await User.findById(agentId);

            if(!agent){
                throw createHttpError.NotFound("agent not found by given Id")
            }

            fuldmagtData.agentName = agent.name.firstName + " " + agent.name.lastName;
            fuldmagtData.agentPhone = agent.phone,
            fuldmagtData.agentDOB = agent.dateOfBirth,
            fuldmagtData.agentEmail = agent.email
        }

        //Setting Up Fuldmagt Giver//
        let fuldmagtGiver = await User.findById(userId);
        if(fuldmagtData.accountType == "user"){
            fuldmagtData.fuldmagtGiverImage = fuldmagtGiver.image;
            fuldmagtData.fuldmagtGiverId = fuldmagtGiver._id;
            fuldmagtData.fuldmagtGiverName = fuldmagtGiver.name.firstName + " " + fuldmagtGiver.name.lastName
        }else if(fuldmagtData.accountType == "company"){
            if(!req.company)
                throw createHttpError.BadRequest("Company is not registered on user")
            
            let company = await Company.findById(req.company);
            fuldmagtData.fuldmagtGiverImage = fuldmagtGiver.image;
            fuldmagtData.fuldmagtGiverId = company._id;
            fuldmagtData.fuldmagtGiverName = company.companyName;
        }

        //--------------Matching Additional Fields from Fuldmagt Form///
        let fuldmagtForm = await fuldmagtFormRepository.getSpecificFuldmagtFormByUser(userId, fuldmagtData.fuldmagtFormId);
        if(!fuldmagtForm){
            throw createHttpError.BadRequest("Fuldmagt Form Id is not valid")
        }
        
        for(let i = 0; i<fuldmagtForm.additionalFields.length; i++){
            if(fuldmagtForm.additionalFieldsType[i] == "headline" || fuldmagtForm.additionalFieldsType[i]=="note" ||
                fuldmagtForm.additionalFieldsType[i] == "textField" || fuldmagtForm.additionalFieldsType[i] == "textArea" ||
                fuldmagtForm.additionalFieldsType[i] == "radioButtons"
            ){
                if(! (fuldmagtData.additionalFieldsData[i] instanceof String || typeof fuldmagtData.additionalFieldsData[i] == "string")){
                    throw createHttpError.BadRequest("Data for field " + fuldmagtForm.additionalFields[i]+" is not correct")
                }
            }
            else if (
                fuldmagtForm.additionalFieldsType[i] == "date"
            ){
                
                try{
                    fuldmagtData.additionalFieldsData[i] = new Date (fuldmagtData.additionalFieldsData[i])
                }
                catch (err){
                    throw createHttpError.BadRequest("Data for field " + fuldmagtForm.additionalFields[i]+" is not correct")
                }
            }
            else if (
                fuldmagtForm.additionalFieldsType[i] == "checkBoxes"
            ){
                if(!Array.isArray(fuldmagtData.additionalFieldsData[i])){
                    throw createHttpError.BadRequest("Data for field " + fuldmagtForm.additionalFields[i]+" is not correct")
                }
            }
        }        

        fuldmagtData.fuldmagtStatment = fuldmagtForm.fuldmagtStatement;
        
        let fuldmagt = new Fuldmagt(fuldmagtData);

        await fuldmagt.save();

        fuldmagtServices.notifyFuldmagtCreation(fuldmagt, agent)

        return fuldmagt;
    },
    async notifyFuldmagtRequest(fuldmagtRequest, fuldmagtGiver){
        if(!fuldmagtGiver){
            let emailSubject = fuldmagtRequest.agentName + " has requested the fuldmagt " + fuldmagtRequest.title;
            await sendEmail(fuldmagtRequest.fuldmagtGiverEmail, emailSubject, createFuldmagtRequestTemplate(fuldmagtRequest))
        }
        else //If Agent Exists, Send Notification to App as well
        { 
            let notificationSetting = await NotificationSetting.findOne({userId: fuldmagtGiver._id})
            
            if(notificationSetting.activityNotification.pushNotification){
                fuldmagtGiverNtofication = {
                    title: `${fuldmagtRequest.title} Fuldmagt Request`,
                    body: fuldmagtRequest.agentName + " has requested the fuldmagt " + fuldmagtRequest.title,
                    data: {
                        actionType: "request_fuldmagt",
                        fuldmagtRequestId: fuldmagtRequest._id + ""
                    },
                    imageUrl: fuldmagtRequest.postImage,
                    recipient: fuldmagtGiver._id
                }
    
                notificationServices.sendNotification(fuldmagtGiverNtofication);
            }
            if(notificationSetting.activityNotification.email){
                let emailSubject = fuldmagtRequest.agentName + " has requested the fuldmagt " + fuldmagtRequest.title;
                await sendEmail(fuldmagtGiver.email, emailSubject, createFuldmagtRequestTemplate(fuldmagtRequest))
            }
        }
    },
    async notifyFuldmagtCreation(fuldmagt, agent){
        if(!agent){
            let emailSubject = fuldmagt.fuldmagtGiverName + " has signed the fuldmagt " + fuldmagt.title;
            await sendEmail(fuldmagt.agentEmail, emailSubject, createFuldmagtEmailTemplate(fuldmagt))
        }
        else //If Agent Exists, Send Notification to App as well
        { 
            let notificationSetting = await NotificationSetting.findOne({userId: agent._id})
            console.log(notificationSetting);
            if(notificationSetting.activityNotification.pushNotification){
                agentNotification = {
                    title: `${fuldmagt.title} Fuldmagt Signed`,
                    body: fuldmagt.fuldmagtGiverName + " has signed the fuldmagt " + fuldmagt.title,
                    data: {
                        actionType: "create_fuldmagt",
                        fuldmagtId: fuldmagt._id + ""
                    },
                    imageUrl: fuldmagt.postImage,
                    recipient: agent._id
                }
    
                notificationServices.sendNotification(agentNotification);
            }
            if(notificationSetting.activityNotification.email){
                let emailSubject = fuldmagt.fuldmagtGiverName + " has signed the fuldmagt " + fuldmagt.title;
                await sendEmail(agent.email, emailSubject, createFuldmagtEmailTemplate(fuldmagt))
            }
        }
        
    },
    async notifyFuldmagtRevoke(fuldmagt){
        if(!fuldmagt.agentId){
            let emailSubject = fuldmagt.fuldmagtGiverName + " has revoked the fuldmagt " + fuldmagt.title;
            await sendEmail(fuldmagt.agentEmail, emailSubject, revokedFuldmagtEmailTemplate(fuldmagt))
        }
        else //If Agent Exists, Send Notification to App as well
        { 
            let notificationSetting = await NotificationSetting.findOne({userId: fuldmagt.agentId})
            
            if(notificationSetting.activityNotification.pushNotification){
                agentNotification = {
                    title: `${fuldmagt.title} Fuldmagt Revoked`,
                    body: fuldmagt.fuldmagtGiverName + " has revoked the fuldmagt " + fuldmagt.title,
                    data: {
                        actionType: "revoke_fuldmagt",
                        fuldmagtId: fuldmagt._id + ""
                    },
                    imageUrl: fuldmagt.postImage,
                    recipient: fuldmagt.agentId
                }
    
                notificationServices.sendNotification(agentNotification);
            }
            if(notificationSetting.activityNotification.email){
                let emailSubject = fuldmagt.fuldmagtGiverName + " has revoked the fuldmagt " + fuldmagt.title;
                await sendEmail(fuldmagt.agentEmail, emailSubject, revokedFuldmagtEmailTemplate(fuldmagt))
            }
        }
    },
    async notifyFuldmagtUpdate(){

    },
    async fulmagtsChangeEmail(oldEmail, newEmail){
        const updatedFuldmagts = await Fuldmagt.findOneAndUpdate(
            {
              agentEmail: oldEmail // Check if email matches
            },
            {
              $set: { agentEmail: newEmail } // Update the fuldmagtGiverId with the new ID
            },
            { new: true } // Return the updated document
        );

        return updatedFuldmagts;
    },
    async fuldmagtsAssignUserIdByEmail(userId, email){
        const updatedFuldmagt = await Fuldmagt.findOneAndUpdate(
            {
              fuldmagtGiverId: { $exists: false }, // Check if fuldmagtGiverId is undefined
              agentEmail: email // Check if email matches
            },
            {
              $set: { fuldmagtGiverId: new mongoose.Schema.Types.ObjectId(userId) } // Update the fuldmagtGiverId with the new ID
            },
            { new: true } // Return the updated document
        );

        return updatedFuldmagt;
    },
    async fuldmagtAssignmentForUserRegistration(user){
        let userEmail = user.email;


    },
    async fuldmagtAssignmentForEmailChange(user){
        
    },
    
}

module.exports = fuldmagtServices