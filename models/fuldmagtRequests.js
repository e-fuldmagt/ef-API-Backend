const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtRequestSchema = new Schema({
  title: {
    type:String,
    required: true
  },
  postImage: {
    type: String
  },
  accountType: {
    type: String,
    enum: ["user", "company"],
    default: "user"
  },
  fuldmagtGiverId:{
    type: Schema.ObjectId,
    refPath: 'accountType'
  },
  fuldmagtGiverName: {
    type: String,
    required: true
  },
  fuldmagtGiverEmail: {
    type: String,
    required: true
  },
  fuldmagtGiverPhone: {
    type:{
      countryCode: String,
      number: Number,
    },
    required: true
  },
  agentId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
  agentName: {
    type: String,
    required: true
  },
  agentDOB: {
    type: Date
  },
  agentEmail: {
    type: String,
    required: true
  },
  agentPhone: {
    type:{
      countryCode: String,
      number: Number,
    },
    required: true
  },
  expiry: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

const FuldmagtRequest = mongoose.model("fuldmagtRequest", fuldmagtRequestSchema, "fuldmagtRequests");

module.exports = FuldmagtRequest
