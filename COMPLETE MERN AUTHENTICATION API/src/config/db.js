const mongoose = require("mongoose");

//ASYNC FUNCTION of connectdb
//whereever it will be called will require a paramter url
const connectdb = async (DATABASEURL) => {
  try {
    const dboption = {
      //database name
      dbname: "mernauth",
    };
    //calling connect method of mongoose
    await mongoose.connect(DATABASEURL, dboption);
    //to see connection
    console.log("connected successfully");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectdb;
