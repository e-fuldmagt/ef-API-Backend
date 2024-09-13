const mongoose = require("mongoose");
const Notification = require("../../models/notification");
const User = require("../../models/user");


const notificationController = {
  async getUserNotifications(req, res, next){
    try{
        let userId = req.user;

        let notifications  = await Notification.aggregate([
            {
                $match: {
                    recipient: new mongoose.Types.ObjectId(userId)
                }
            },
            {
              $addFields: {
                // Add the 'time' field
                time: {
                    $let: {
                      vars: {
                        diffInMinutes: {
                          $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60]
                        }
                      },
                      in: {
                        $cond: {
                          if: { $lte: ["$$diffInMinutes", 1] },
                          then: "now",
                          else:{
                            $cond: {
                                if: { $lte: ["$$diffInMinutes", 60] },
                                then: { $concat: [{ $toString: { $floor: "$$diffInMinutes" } }, " min"] },
                                else:{
                                    $cond: {
                                        if: { $lte: ["$$diffInMinutes", 24*60] },
                                        then: { $concat: [{ $toString: { $floor: {$divide: ["$$diffInMinutes", 60]} } }, " hr"] },
                                        else: { $concat: [{ $toString: { $floor: {$divide: ["$$diffInMinutes", 60*24]} } }, " days"] }
                                    }
                                }
                            }
                          }
                        }
                      }
                    }
                  },
                // Add the 'section' field
                section: {
                  $cond: {
                    if: { $eq: [{ $dayOfYear: "$createdAt" }, { $dayOfYear: new Date() }] }, // Same day
                    then: "today",
                    else: "earlier"
                  }
                }
              }
            },
            { $sort: { createdAt: -1 } } // Sort by createdAt in descending order
          ])

        

        return res.status(200).send({
            "success": true,
            "data": {
                notifications
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
    catch(err){
        return res.status(500).send({
            success: false,
            message: err.message
        });
    }
  }
};

module.exports = notificationController;
