const usermodel = require("../models/user");
const bcrypt = require("bcrypt"); //for hashing
const jwt = require("jsonwebtoken");
const transporterfxn = require("../config/emailconfig");

//whenever user successfully signup or login then he will get a jwt token to work anything

class UserController {
  //all fucntions will be static
  static userRegistration = async (req, res) => {
    //here frontend form rahega jisse data aayega aur backend mein manage karna hai
    //let data is coming from req/frontend
    //distributing of req.body in object
    const { name, email, password, passwordconfirmation, tc } = req.body;

    //now checking already exit user or not
    //comparing the email of usermodel with the frontende se aa raha as req.body
    //agar hai toh user varaible mein object milega uska
    const user = await usermodel.findOne({ email: email });
    if (user) {
      res.send({
        status: "400",
        message: "User already exits",
      });
    } else {
      //if not found already existing
      //checking validation whether data is correct formatted all data are present or not
      if (name && email && password && passwordconfirmation && tc) {
        //now registartion proceed
        if (password === passwordconfirmation) {
          try {
            //finally about to done registration
            //but hashing
            const salt = await bcrypt.genSalt(12); //creating salt //high salt high secure password
            //hashing
            const hashpassword = await bcrypt.hash(password, salt); //first password to be hashed then salt
            const doc = new usermodel({
              //now putting into database
              name: name,
              email: email,
              ///password:password, not as itis we have to hash it
              password: hashpassword, //even if database get hacked then also user ka password hack nahi hoga
              tc: tc,
            });
            //ab sab doc mein hai aur save kar diya
            await doc.save();

            //////////JWT TOKEN generate through id////////////////////
            //below gives the currently saved user
            const saved_user = await usermodel.findOne({ email: email });

            //making token --5d,5m days and minute
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            //also send this token to user through response

            //to avoid infinite sending request so giving response
            res.status(200).send({
              status: "sucees",
              message: "regsitration done",
              token: token,
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          res.status(400).send("password doesnot match");
        }
      } else {
        res.status(400).send("All fields are required");
      }
    }
  };

  //fucntion for login
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        //if both values are given
        //now checking whether email is registered or not find it
        const user = await usermodel.findOne({ email: email });
        if (user != null) {
          //if user found then login process starts
          //now we have to compare haspass of database with user provided
          const isMatch = await bcrypt.compare(password, user.password); //frontend password , hashpassword of user model database =2nd argument
          //true or false
          if (user.email === email && isMatch) {
            ///GENERATING TOKEN
            //below user ki id nt saved user like registration
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );

            //both email and password true should be
            //individually dont as email or password may be hacked
            res.send({ message: "success login", token: token, user });
          } else {
            res.send("Either email or password wrong");
          }
        } else {
          res.send("you are not registered user");
        }
      } else {
        res.send("aLL fields are required");
      }
    } catch (err) {
      console.log("unable ot login");
    }
  };

  ////////////////////CHNAGE PASSWORD/////////////////////
  //user knows the password just want to change it after login ye kaam hoga
  //making function
  static changeUserPassword = async (req, res) => {
    const { password, passwordconfirmation } = req.body; //both are given
    if (password && passwordconfirmation) {
      //if both are there
      if (password != passwordconfirmation) {
        res.send("password doesnot macth");
      } else {
        const salt = await bcrypt.genSalt(12);
        const newhashpassword = await bcrypt.hash(password, salt);
        ///now we will update in database the password

        await usermodel.findByIdAndUpdate(req.user._id, {
          $set: { password: newhashpassword },
        });
        //here based on userid we will upadte password with hashpassword

        res.send("password change successfully");
        //console.log(req.user._id)
      }
    } else {
      res.send("All fields are required");
    }
  };

  //logged user ka profile data dikhana
  static loggeduser = async (req, res) => {
    //after authentication we shoq req.user
    res.send({ user: req.user });
  };

  //////////FOGOT PASSWORD////////////
  static SendUserPasswordResetEmail = async (req, res) => {
    ///we will send email to user having link to reset and token of whihc we are setting
    //we will get email in req.body
    const { email } = req.body;
    if (email) {
      //now we will check whether email exits in our database or not
      const user = await usermodel.findOne({ email: email });
      //if matched then we will get user obbject

      if (user) {
        //now we will generate secret key made by userid and jwtsecretkey
        const secret = user._id + process.env.JWT_SECRET_KEY;

        //then send email with link with 15min valid time
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        //creating frontend link to reset
        const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`;
        // console.log(link);
        ///example of link in frontend to get new frontent ot reset  /api/user/reset/:id/:token

        //giving mesage that link has been send
        res.send("please check your email");

        //sending email
        transporterfxn.sendMail({
          // from:process.env.EMAIL_FROM,
          to: user.email, //not req.body.email
          subject: "Please reset the password",
          // html: `<p>You can reset password within 15 minutes</p>`,
          html: `<a href=${link}> Click here to reset your password</a> <p> You can reset password within 15 minutes</p>`,
        });
      } else {
        res.send("email doesnot exits");
      }
    } else {
      res.send("write email");
    }
  };

  /////////AFTER CLICK ON LINK TO UPDATE PASSWORD////////
  static UserPassReset = async (req, res) => {
    //but now we have to update password in database wihtin 15min time validation and also which user's password to update
    const { password, passwordconfirmation } = req.body;
    const { id, token } = req.params;
    //form's data come in body of req
    //urls data come in params of req

    const user = await usermodel.findById(id);

    //creating new token so that we can match with the sent through the link
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    //now we will verify the token created now and the one sent through the link
    try {
      jwt.verify(token, new_secret);
      if (password && passwordconfirmation) {
        if (password === passwordconfirmation) {
          const salt = await bcrypt.genSalt(12);
          const newhashpassword = await bcrypt.hash(password, salt);
          ///now we will update in database the password

          await usermodel.findByIdAndUpdate(user._id, {
            $set: { password: newhashpassword },
          });
          res.send("password reset successfully");
        } else {
          res.send("password doesnt match");
        }
      } else {
        res.send("all fields are required");
      }
    } catch (error) {
      console.log(error);
      res.send("invalid token");
    }
  };
}

//whole class get exported(all fxn everything)
module.exports = UserController;
