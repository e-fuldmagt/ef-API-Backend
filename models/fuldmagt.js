const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtSchema = new Schema({
  createdByUser: {
    type: mongoose.Schema.ObjectId, 
    ref: "user"
  },
  createdByCompany: {
    type: mongoose.Schema.ObjectId, 
    ref: "company"
  },
  pickByUser: {
    type: mongoose.Schema.ObjectId, 
    ref: "user"
  },
  pickByCompany: {
    type: mongoose.Schema.ObjectId, 
    ref: "company"
  },
  expiry:{
    type: Date,
    required: true
  }
});
module.exports = mongoose.model("fuldmagt", fuldmagtSchema, "fuldmagts");
