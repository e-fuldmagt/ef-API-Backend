const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtSchema = new Schema({
  title: {
    type:String,
    required: true
  },
  postImage: {
    type: String,
    default: ""
  },
  accountType: {
    type: String,
    enum: ["user", "company"],
  },
  fuldmagtGiverId: {
    type: mongoose.Schema.ObjectId,
    refPath: 'accountType', // Dynamic reference based on accountType
  },
  fuldmagtGiverName: {
    type: String,
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
  signature: {
    type: String,
    required: true
  },
  revoked:{
    type: Boolean,
    default: false
  },
  revokedDate:{
    type: Date
  },
  expiry: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedDate: {
    type: Date,
  }
});

const Fuldmagt = mongoose.model("fuldmagt", fuldmagtSchema, "fuldmagts");

module.exports = Fuldmagt
