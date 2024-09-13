const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtSchema = new Schema({
  title: {
    type:String,
    required: true
  },
  postImage: {
    type: String,
    required: true
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
  }
});

const Fuldmagt = mongoose.model("fuldmagt", fuldmagtSchema, "fuldmagts");

module.exports = Fuldmagt
