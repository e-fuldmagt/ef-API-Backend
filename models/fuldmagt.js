const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtSchema = new Schema({
  form: {
    type: String,
    required: true,
  },
  visibility: {
    user: [{ type: mongoose.Schema.ObjectId, required: true, ref: "user" }],
    company: [
      { type: mongoose.Schema.ObjectId, required: true, ref: "company" },
    ],
  },
});
module.exports = mongoose.model("fuldmagt", fuldmagtSchema, "fuldmagts");
