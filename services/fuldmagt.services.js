const jwt = require("jsonwebtoken")
const notificationServices = require("./notification.services")
const { sendEmail } = require("./MailService")
const mongoose = require("mongoose")

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

const fuldmagtServices = {
    async notifyFuldmagtCreation(fuldmagt, agent){
        let fuldmagtToken = jwt.sign({fuldmagtId: fuldmagt._id}, process.env.FULDMAGT_TOKEN)

        
        let emailSubject = fuldmagt.fuldmagtGiverName + " has signed the fuldmagt " + fuldmagt.title;
        await sendEmail(fuldmagt.agentEmail, emailSubject, createFuldmagtEmailTemplate(fuldmagt))
        

        if(agent) //If Agent Exists, Send Notification to App as well
        { 
            
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
    },
    async notifyFuldmagtRevoke(fuldmagt){

        let emailSubject = fuldmagt.fuldmagtGiverName + " has revoked the fuldmagt " + fuldmagt.title;
        await sendEmail(fuldmagt.agentEmail, emailSubject, revokedFuldmagtEmailTemplate(fuldmagt))
        

        if(fuldmagt.agentId) //If Agent Exists, Send Notification to App as well
        { 
            
            agentNotification = {
                title: `${fuldmagt.title} Fuldmagt Signed`,
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
        
    }
}

module.exports = fuldmagtServices