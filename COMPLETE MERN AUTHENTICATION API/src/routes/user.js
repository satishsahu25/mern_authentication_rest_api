const express = require("express");
const router = express.Router();
const Usercontroller = require("../controllers/usercontroller");
const checkuserauth = require("../middlewares/authmiddleware");

//route level middleware to protect route
//when some hit this url then first check auth runs for token verificatrion then next is called in
router.use("/changepassword", checkuserauth);

//middleware chipkaana in looged user paths
router.get("/loggeduser", checkuserauth);

//public routes before login
//jab /register hoga tab usercontroller mein user registration wale fxn ko chal do
router.post("/register", Usercontroller.userRegistration);

//for login
router.post("/login", Usercontroller.userLogin);

//for forgot password link send
router.post("/forgotpassword", Usercontroller.SendUserPasswordResetEmail);

//for forgot password now reset on lnik click
router.post("/resetpassword/:id/:token", Usercontroller.UserPassReset);

//protected routes after login

//for change password
// we need a user
router.post("/changepassword", Usercontroller.changeUserPassword);

//for profile of logged user
router.get("/loggeduser", Usercontroller.loggeduser);

module.exports = router;
