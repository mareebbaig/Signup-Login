import { compareSync, hash } from "bcrypt";
import User from "../models/user.js";
import Token from "../models/token.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
var forgetPassToken = null;
import { dirname } from "path";

import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const resetPassword = async (req, res) => {
  if (!forgetPassToken) {
    res
      .status(400)
      .send("<html> <body><h1> Verify your email first! </h1></body></html>");
  } else {
    const userToken = await Token.findOne({ token: forgetPassToken });
    if (!userToken) {
      res.status(400).send({ message: "Invalid or no token!" });
    } else {
      const userid = await User.findOne({ _id: userToken.userID });

      if (!userid) res.status(400).send({ message: "user not found" });
      else {
        console.log(userid);
        const hashedPassword = await hash(req.body.password, 10);

        const userUpdate = await User.updateOne(
          { _id: userid._id },
          {
            $set: { password: hashedPassword },
          },
        );

        if (userUpdate.matchedCount > 0)
          res
            .status(200)
            .send("<html> <body><h1> Password Updated !</h1></body></html>");
      }
    }
  }
};

const forgetPassword = async (req, res) => {
  const userEmail = await User.findOne({ emailId: req.body.emailId });

  if (!userEmail) {
    res
      .status(400)
      .send("<html> <body><h1>User does not exist!</h1></body></html>");
  } else {
    const userToken = await Token.findOne({ userID: userEmail._id });

    if (!userToken) {
      res.status(400).send({ message: "No tokens found" });
    } else {
      forgetPassToken = userToken.token;
      const path = __dirname + "\\html pages\\forgetPassword.html";

      var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: "noReply3199@gmail.com",
          pass: "uhzuxynqyexzlmgj",
        },
      });

      let info = await transporter.sendMail({
        from: "noReply3199@gmail.com",
        to: userEmail.emailId,
        subject: "Forget Password",
        text: path,
      });

      res
        .status(200)
        .send(
          "<html> <body><h1> Reset Password link send to your email </h1></body></html>",
        );
      console.log("Message sent: %s", info);
      console.log(info.accepted);
      console.log(info.envelope);
    }
  }
};

const verifyUser = async (req, res) => {
  const userToken = await Token.findOne({ token: req.params.token });

  if (!userToken) {
    res.status(400).send({ message: "Authentication Failed! No tokens found" });
  } else {
    await User.updateOne(
      { _id: userToken.userID },
      {
        $set: { isVerified: true },
      },
    );

    res
      .status(200)
      .send(
        "<html> <body><h1> Successfully Verified! <p> Go Back to the login page </p></h1></body></html>",
      );
  }
};

const login = async (req, res, next) => {
  console.log("hello login");
  if (!req.body.emailId || !req.body.password) {
    return res
      .status(400)
      .send("<html> <body><h1>All fields are required!</h1></body></html>");
  }

  const user = await User.findOne({ emailId: req.body.emailId });

  if (!user)
    return res
      .status(200)
      .send(
        "<html> <body><h1>User email does not exits! Please Register first</h1></body></html>",
      );
  else {
    const validPassword = compareSync(req.body.password, user.password);
    if (!validPassword)
      return res
        .status(200)
        .send("<html> <body><h1>Invalid Password</h1></body></html>");
    else if (!user.isVerified)
      return res
        .status(200)
        .send(
          "<html> <body><h1>User not Verified <p>check your email for verification link or register again</p></h1></body></html>",
        );
    else {
      return res
        .status(200)
        .send("<html> <body><h1> Successfully Logged in! </h1></body></html>");
    }
  }
};

const signup = async (req, res, next) => {
  const user = await User.findOne({ emailId: req.body.emailId });

  if (user) {
    res
      .status(400)
      .send({ message: "User Already associated with this account" });
  } else {
    const hashedPassword = await hash(req.body.password, 10);
    const newUser = new User({
      emailId: req.body.emailId,
      password: hashedPassword,
    });

    // generate token and save
    var token = new Token({
      userID: newUser._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await newUser.save();
    await token.save();

    res
      .status(200)
      .send(
        "<html> <body><h1> User has been successfully registered! Check your inbox of registered email for verification </h1></body></html>",
      );

    // let testAccount = await nodemailer.createTestAccount();

    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "noReply3199@gmail.com",
        pass: "uhzuxynqyexzlmgj",
      },
    });

    let info = await transporter.sendMail({
      from: "noReply3199@gmail.com", // sender address
      to: newUser.emailId, // list of receivers
      subject: "Account Verification", // Subject line
      text: `http://localhost:3000/api/user/verifyuser/${token.token}`, // plain text body
    });

    console.log("Message sent: %s", info);
    console.log(info.accepted);
    console.log(info.envelope);
  }

  //     // Send email (use verified sender's email address & generated API_KEY on SendGrid)
  //     const transporter = nodemailer.createTransport(
  //       sendgridTransport({
  //         auth: {
  //           api_key: process.env.SENDGRID_APIKEY,
  //         },
  //       }),
  //     );
  //     var mailOptions = {
  //       from: "no-reply@example.com",
  //       to: user.email,
  //       subject: "Account Verification Link",
  //       text:
  //         "Hello " +
  //         req.body.name +
  //         ",\n\n" +
  //         "Please verify your account by clicking the link: \nhttp://" +
  //         req.headers.host +
  //         "/confirmation/" +
  //         user.email +
  //         "/" +
  //         token.token +
  //         "\n\nThank You!\n",
  //     };
  //     transporter.sendMail(mailOptions, function (err) {
  //       if (err) {
  //         return res.status(500).send({
  //           msg: "Technical Issue!, Please click on resend for verify your Email.",
  //         });
  //       }
  //       return res
  //         .status(200)
  //         .send(
  //           "A verification email has been sent to " +
  //             user.email +
  //             ". It will be expire after one day. If you not get verification Email click on resend token.",
  //         );
  //     });
  //   });
  // });
};
// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)

export { login, signup, verifyUser, forgetPassword, resetPassword };
