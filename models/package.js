const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const packageSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  userAccount: {
    type: String,
    required: true, // values, user, company
  },
  reciever: {
    type: mongoose.Schema.ObjectId,
  },
  recieverAccount: {
    type: String,
  },
  expiry: {
    type: Date,
    required: true,
  },
  isRequest: {
    type: Boolean,
    default: false,
  },
  revoke:{
    type: Boolean
  },
  recieverName: {
    firstName: { type: String },
    lastName: { type: String },
  },
  recieverDOB: {
    type: String,
  },
  recieverEmail: {
    type: String,
  },
  recieverNumber: {
    type: Number,
  },
  signature: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("package", packageSchema, "packages");
