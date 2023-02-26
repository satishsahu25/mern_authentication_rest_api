require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.port;
const db = require("../Mern_authenticate/src/config/db");
const DATABASEURL =process.env.DATABASEURI
const userroutes = require("../Mern_authenticate/src/routes/user");

//CORS Policy
app.use(cors());

//calling dbconnection to send url of db
db(DATABASEURL);

//json
app.use(express.json());

//loading routes
app.use("/api/user", userroutes);

app.listen(port, () => {
  console.log(`server running at:  ${port}`);
});
