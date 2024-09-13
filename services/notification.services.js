const Notification = require("../models/notification");
const User = require("../models/user");
const { firebase } = require("./Firsebase_Notifications");

function getMessageBody(notificationId, image, title, body, data){
    return {
        data: data,
        notification: {
            image,
            title,
            body
        },
        token: notificationId
    };
}

let notificationServices = {
    async sendFirebaseNotificationByUserId(userId, title, body, data, image){
        let user = await User.findById(userId);
        let notificationPromises = [];
        let notificationIdsWithErrors = [];
        
        for(let i = 0; i<user.notificationIds.length; i++){
            let message = getMessageBody(user.notificationIds[i], image, title, body, data)
            notificationPromises.push(firebase.messaging().send(message).then(
                (result)=>{
                    
                }
            ).catch(
                (error)=>{
                    notificationIdsWithErrors.push(user.notificationIds[i])
                }
            ))
        }
        //
        await Promise.allSettled(notificationPromises);

        user.notificationIds = 
        user.notificationIds.filter((nId)=> 
            {return notificationIdsWithErrors.findIndex((ne) => ne==nId)==-1}
        );

        await user.save();

        let status = {
            "successfulNotificationsSent": notificationPromises.length - notificationIdsWithErrors.length,
            "failedNotificationsSent": notificationIdsWithErrors.length,
            "totalNotifcations": notificationPromises.length
        }
        
        return status
    },
    async sendNotification({title, body, imageUrl, data, recipient}){
        try{
            let notification = new Notification({title, body, imageUrl, data, recipient});

            await notification.save();

            await this.sendFirebaseNotificationByUserId(receipt, title, body, data, imageUrl);
        }
        catch(err){
            console.log(err);
        }
    }
}

module.exports = notificationServices