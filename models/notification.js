const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Schema for storing action-specific data
const actionDataSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['default', 'sent_package', 'receive_package'],
    required: true,
    default: "default"
  },
  package: {
    type: Schema.Types.ObjectId, 
    ref: "Package",
    required: function () {
      return this.actionType === 'sent_package' || this.actionType === 'receive_package';
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
  }
});

const Notification = mongoose.model("Notification", notificationSchema)
module.exports = Notification
