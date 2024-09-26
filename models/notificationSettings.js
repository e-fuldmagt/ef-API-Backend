const { type } = require("@hapi/joi/lib/extend");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const notificationSettingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  activityNotification: {
    email: {
      type: Boolean,
      required: true,
      default: true
    },
    pushNotification: {
      type: Boolean,
      required: true,
      default: true
    }
  }
});

const NotificationSetting =  mongoose.model("notificationSetting", notificationSettingSchema, "notificationSettings");
module.exports = NotificationSetting;