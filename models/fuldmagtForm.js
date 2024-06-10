const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtFormSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  form: {
    type: String,
    required: true,
  },
  visibility: {
    user: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    company: [
      { type: mongoose.Schema.ObjectId, ref: "company" },
    ],
  },
});
module.exports = mongoose.model("fuldmagtForm", fuldmagtFormSchema, "fuldmagtForms");
