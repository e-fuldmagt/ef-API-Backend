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

        if(checkUser && checkUser._id != user._id){
            return res.status(400).send({
                success: false,
            })
        }
    }
    catch(e){
        
    }
  }
};

module.exports = notificationController;
