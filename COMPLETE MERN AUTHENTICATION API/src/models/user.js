const mongoose = require("mongoose");

//USER SCHEMA DEFINING
const userschema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  tc: { type: Boolean, required: true },
  //terms and condition
});

//USER MODEL of userschema named user(table name)
const userModel = mongoose.model("user", userschema);

//exporting the usermodel whihc is used in controller
module.exports = userModel;
