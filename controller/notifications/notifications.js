const User = require("../../models/user");


const notificationController = {
  async addNotificationToken(req, res, next){
    try{
        let userId = req.user;

        let {notificationId} = req.body;

        let user = await User.findById(userId);

        if(!user){
            return res.status(404).send({
                success: false,
                message: "User doesn't exist with given credentials"
            })
        }

        //check if there is a user with already same notificationId
        let checkUser = await User.findOne({notificationIds: notificationId});

        if(checkUser && checkUser._id.toString() == user._id.toString()){
            checkUser.notificationIds = checkUser.notificationIds.filter(
                (nId) => nId != notificationId
            )
            await checkUser.save();
        }

        if(checkUser && checkUser._id.toString() == user._id.toString()){
            return res.status(200).send({
                success: true,
                message: "Notifcation Id is already attached to given user."
            })
        }

        user.notificationIds.push(notificationId);

        await user.save();

        return res.status(200).send({
            success: true,
            message: "Notifcation Id has been added successfully"
        })
    }
    catch(e){
        await res.status(500).send({

        })
    }
  }
};

module.exports = notificationController;
