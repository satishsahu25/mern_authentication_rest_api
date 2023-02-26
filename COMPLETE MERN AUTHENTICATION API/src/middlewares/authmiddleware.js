const jwt = require("jsonwebtoken");
const usermodel = require("../models/user");

//checking authenticity
//to access the change password fucntion in controller he must give token first as a valid user should do logged in or registered
//everytime a user gets token for login or registration
var checkuserauth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      //get token from header
      token = authorization.split(" ")[1];
      //token on 1 while space on 0 to separate bearer and token

      //to verify token
      //from token we need only userid
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      //verifying token with jwtsecretkey

      //get user from token
      //based on id we get user object
      req.user = await usermodel.findById(userID).select("-password"); //except password everything from database comes
      next();
    } catch (error) {
      res.send({ message: "unauthorized user" });
    }
  }

  //if no token
  if (!token) {
    res.send({ message: "unauthorized user and no token" });
  }
};

module.exports = checkuserauth;
