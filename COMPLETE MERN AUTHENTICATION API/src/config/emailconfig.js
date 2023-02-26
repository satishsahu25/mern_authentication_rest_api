const nodemailer = require("nodemailer");
require("dotenv").config();

//transpoter function
let emailtransporterfxn = nodemailer.createTransport({
  service: "gmail",
  // give below the sender's email and app generateed password
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.APPGENPASSBYGMAIL,
  },
});

module.exports = emailtransporterfxn;
