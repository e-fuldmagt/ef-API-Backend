const jwt = require("jsonwebtoken")
const notificationServices = require("./notification.services")


const fuldmagtServices = {
    async notifyFuldmagtCreation(fuldmagt, agent){
        let fuldmagtToken = jwt.sign({fuldmagtId: fuldmagt._id}, process.env.FULDMAGT_TOKEN)

        if(agent) //If Agent Exists, Send Notification to App as well
        { 
            agentNotification = {
                title: "Fuldmagt Signed",
                body: fuldmagt.fuldmagtGiverName + " has signed the fuldmagt",
                data: {
                    actionType: "create_fuldmagt",
                    fuldmagtId: fuldmagt._id
                },
                imageUrl: fuldmagt.postImage,
                recipient: agent._id
            }

            notificationServices.sendNotification(agentNotification);
        }


    },
    async notifyFuldmagtRevoke(){
        //senderId,
        //senderName,
        //receiverId,
        //receiverName,
        //packageImage, packageTitle, packageId
    },
    async notifyFuldmagtUpdate(){

    }
}

module.exports = fuldmagtServices