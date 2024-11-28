const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtSchema = new Schema({
  fuldmagtFormId: {
    type: mongoose.Schema.ObjectId,
    ref: "fuldmagtForm",
    required: true
  },
  accountType: {
    type: String,
    enum: ["user", "company"],
  },
  fuldmagtGiverImage: {
    type: String,
    required: true
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
  fuldmagtGiverSignature: {
    type: String,
    required: true
  },
  agentSignature: {
    type: String
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
  additionalFieldsData: {
    type: [Object],
    required: true
  },
});

const Fuldmagt = mongoose.model("fuldmagt", fuldmagtSchema, "fuldmagts");

module.exports = Fuldmagt
