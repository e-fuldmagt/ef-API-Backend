const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Schema for storing action-specific data
const actionDataSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['default', 'create_fuldmagt', 'update_fuldmagt', 'revoke_fuldmagt', 'acknowledge_fuldmagt'],
    required: true,
    default: "default"
  },
  fuldmagtId: {
    type: Schema.Types.ObjectId, 
    ref: "Package",
    required: function () {
      return this.actionType === 'create_fuldmagt' || this.actionType === 'update_fuldmagt' || this.actionType === 'revoke_fuldmagt' || this.actionType === 'acknowledge_fuldmagt';
    },
  }
}, { _id: false });

const notificationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  imageUrl:{
    type: String
  },
  data: {
    type: actionDataSchema, // Stores data specific to the action
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId, // reference to User schema
    ref: 'User',
    required: true,
  },
  createdAt:{
    type: Date,
    default: new Date()
  }
});

const Notification = mongoose.model("Notification", notificationSchema)
module.exports = Notification
