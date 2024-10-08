const User = require("../../models/user");
const Joi = require("joi");
const Otp = require("../../models/otp");
const bcrypt = require("bcryptjs");

const otpGenerator = require("otp-generator");
const mailService = require("../../services/MailService");
const userServices = require("../../services/user.services");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

const accountSid = "ACfcb9da3700c2632b98d2c9dbd6ebd3d3";
const authToken = "5e5c1a2d02929d0b6d09c31535fbd03b";
const client = require("twilio")(accountSid, authToken);

// Define Joi schema for email validation
const emailSchema = Joi.string().email().required();

const otpController = {
  // ......................send otp ............................
  async sendOTPToCredentials(req, res, next){
    try{
      const {email, phone} = req.body;
      let resBody = null;
      if(email){
        resBody = await userServices.sendOTPToEmail(email);
      }
      if(phone){
        resBody = await userServices.sendOTPToNumber(phone)
      }
      if(!resBody){
        return res.status(400).json({
          success: false,
          message: "request body is not valid"
        })
      }
      res.status(200).json({
        success: true,
        data: {...resBody}
      })
    }
    catch(e){
      console.log(e);
      res.status(500).json({
        success: false,
        data: { e: e.message },
      });
    }
  },
  async verifySignupOtp(req, res, next){
    try{
      const {otp, encryptedOTPToken} = req.body;
      //Decrypt OTP Token
      let otpToken = cryptoJs.AES.decrypt(encryptedOTPToken, process.env.ENCRYPTION_KEY).toString(cryptoJs.enc.Utf8);
      //Verify Token for Temparing
      let otpTokenDecrypted = jwt.verify(otpToken, process.env.OTP_TOKEN_SECRET);
      
      if(otp != otpTokenDecrypted.otp){
        return res.status(400).send({
          success: false,
          message: "Otp doesn't match"
        })
      }

      if(await userServices.getUserByCredentials(otpTokenDecrypted.credentials)){
        return res.status(400).send({
          success: false,
          message: "User already exists with current credentials"
        })
      }

      //getting equal make a jwt for making account//
      let credentialsToken = jwt.sign(otpTokenDecrypted.credentials, process.env.SIGNUP_TOKEN_SECRET);
      
      res.status(200).json({
        success: true,
        data: {credentialsToken}
      })
    }
    catch(e){
      console.log(e);
      res.status(500).json({
        success: false,
        data: { e: e.message },
      });
    }
  },
  async verifyForgotPasswordOtp(req, res, next){
    try{
      const {otp, encryptedOTPToken} = req.body;
      let resBody = null;
      resBody = await userServices.verifyForgotPasswordOtp(encryptedOTPToken, otp);

      if(!resBody){
        return res.status(400).json({
          success: false,
          message: "request body is not valid"
        })
      }
      res.status(200).json({
        success: true,
        data: {...resBody}
      })
    }
    catch(e){
      console.log(e);
      res.status(500).json({
        success: false,
        data: { e: e.message },
      });
    }
  },
  async verifyUpdateEmailOtp(req, res, next){
    try{
      const userId = req.user;
      const {otp, encryptedOTPToken} = req.body;
      //Decrypt OTP Token
      let otpToken = cryptoJs.AES.decrypt(encryptedOTPToken, process.env.ENCRYPTION_KEY).toString(cryptoJs.enc.Utf8);
      //Verify Token for Temparing
      let otpTokenDecrypted = jwt.verify(otpToken, process.env.OTP_TOKEN_SECRET);
      
      if(otp != otpTokenDecrypted.otp){
        return res.status(400).send({
          success: false,
          message: "Otp doesn't match"
        })
      }

      
      if(!otpTokenDecrypted.credentials.email){
        return res.status(400).send({
          success: false,
          message: "Email doesn't not doesn't exist in credentials"
        })
      }

      if(await userServices.getUserByCredentials(otpTokenDecrypted.credentials)){
        return res.status(400).send({
          success: false,
          message: "User already exists with given email"
        })
      }

      
      let user = await User.findById(userId);
      user.email = otpTokenDecrypted.credentials.email;

      await user.save()
      
      res.status(200).json({
        success: true,
        message: "Email has been changed successfully",
        data: {
          updatedUser: user
        }
      })
    }
    catch(e){
      res.status(500).json({
        success: false,
        data: { e: e.message },
      });
    }
  },
  async verifyUpdatePhoneNumberOtp(req, res, next){
    try{
      const userId = req.user;
      const {otp, encryptedOTPToken} = req.body;
      //Decrypt OTP Token
      let otpToken = cryptoJs.AES.decrypt(encryptedOTPToken, process.env.ENCRYPTION_KEY).toString(cryptoJs.enc.Utf8);
      //Verify Token for Temparing
      let otpTokenDecrypted = jwt.verify(otpToken, process.env.OTP_TOKEN_SECRET);
      
      if(otp != otpTokenDecrypted.otp){
        return res.status(400).send({
          success: false,
          message: "Otp doesn't match"
        })
      }

      
      if(!otpTokenDecrypted.credentials.phone){
        return res.status(400).send({
          success: false,
          message: "Phone number doesn't not doesn't exist in credentials"
        })
      }
      console.log(otpTokenDecrypted.credentials);
      if(await userServices.getUserByCredentials(otpTokenDecrypted.credentials)){
        return res.status(400).send({
          success: false,
          message: "User already exists with given email"
        })
      }

      let user = await User.findById(userId);
      user.phone = otpTokenDecrypted.credentials.phone;

      await user.save()
      
      res.status(200).json({
        success: true,
        message: "Phone has been changed successfully",
        data: {
          updatedUser: user
        }
      })
    }
    catch(e){
      res.status(500).json({
        success: false,
        data: { e: e.message },
      });
    }
  },
  async sendOTPToEmail(req, res, next) {
    try {
      const { email } = req.body;
      // Validate email using Joi schema
      const { error } = emailSchema.validate(email);
      if (error) {
        return res.status(400).json({
          success: false,
          data: { error: error.details[0].message },
        });
      } else {
        const new_otp = otpGenerator.generate(4, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });

        const otp_expiry_time = Date.now() + 5 * 60 * 1000; // 5 minutes after OTP is sent

        // Find the user by email
        let user = await User.findOne({ email: email });
        let otpExist = await Otp.findOne({ email: email });
        const salt = await bcrypt.genSalt(10);
        let hashedOtp = await bcrypt.hash(new_otp, salt);

        if (user) {
          return res.status(400).json({
            success: false,
            data: { error: "User with this email already exists" },
          });
        } else {
          if (otpExist) {
            // If OTP exists, update the OTP and expiry time
            await Otp.findOneAndUpdate(
              { email },
              { otp: hashedOtp, otp_expiry_time }
            );
          } else {
            // If OTP doesn't exist, create a new OTP record
            otpExist = new Otp({
              email: email,
              otp: hashedOtp,
              otp_expiry_time: otp_expiry_time,
            });
            await otpExist.save();
          }

          // Send OTP email
          await mailService.sendEmail({
            sender: process.env.EMAIL,
            to: email,
            subject: "Verification OTP",
            html: `<p>Your OTP is: ${new_otp}</p>`,
            attachments: [],
          });

          res.status(200).json({
            success: true,
            data: { message: "OTP Sent Successfully!" },
          });
        }
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        data: { error: error.message },
      });
    }
  },

   // ......................send otp .............................
   async sendOTPForPin(req, res, next) {
    try {
      const { email } = req.body;
      // Validate email using Joi schema
      const { error } = emailSchema.validate(email);
      if (error) {
        return res.status(400).json({
          success: false,
          data: { error: error.details[0].message },
        });
      } else {
        const new_otp = otpGenerator.generate(4, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });

        const otp_expiry_time = Date.now() + 5 * 60 * 1000; // 5 minutes after OTP is sent

        // Find the user by email
        let user = await User.findOne({ email: email });
        let otpExist = await Otp.findOne({ email: email });
        const salt = await bcrypt.genSalt(10);
        let hashedOtp = await bcrypt.hash(new_otp, salt);

          if (otpExist) {
            // If OTP exists, update the OTP and expiry time
            await Otp.findOneAndUpdate(
              { email },
              { otp: hashedOtp, otp_expiry_time }
            );
          } else {
            // If OTP doesn't exist, create a new OTP record
            otpExist = new Otp({
              email: email,
              otp: hashedOtp,
              otp_expiry_time: otp_expiry_time,
            });
            await otpExist.save();
          }

          // Send OTP email
          await mailService.sendEmail({
            sender: process.env.EMAIL,
            to: email,
            subject: "Verification OTP",
            html: `<p>Your OTP is: ${new_otp}</p>`,
            attachments: [],
          });

          res.status(200).json({
            success: true,
            data: { message: "OTP Sent Successfully!" },
          });
        }
    } catch (error) {
      res.status(400).json({
        success: false,
        data: { error: error.message },
      });
    }
  },

  // ----------------- verify OTP -----------------
  async verifyEmail(req, res) {
    try {
      // verify otp and update user accordingly
      const { email, otp } = req.body;
      const user = await Otp.findOne({
        email,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          data: { error: "Wrong Email" },
        });
      } else {
        const checkExpiry = await Otp.findOne({
          email,
          otp_expiry_time: { $gt: Date.now() },
        });
        if (!checkExpiry) {
          return res.status(404).json({
            success: false,
            data: { error: "OTP is expired" },
          });
        } else {
          const checkOtp = await bcrypt.compare(otp, user.otp);
          if (checkOtp) {
            await Otp.findOneAndUpdate(
              { email },
              { emailVerification: true }
            );
            return res.status(200).json({
              success: true,
              data: { message: "Otp is correct" },
            });
          } else {
            return res.status(404).json({
              success: false,
              data: { error: "Otp is incorrect" },
            });
          }
        }
      }
    } catch (error) {
      return res.status(404).send({
        success: false,
        data: { error: error.response },
      });
    }
  },

  // ----------------- send Otp To Number -----------------
  async sendOtpToNumber(req, res) {
    try {
      const { phone } = req.body;

      client.messages
        .create({
          body: "Your OTP is: 1234",
          from: "+19203671898",
          to: phone,
        })
        .then((message) => {
          return res.status(200).json({
            success: true,
            data: { message: "message sent", id: message.sid },
          });
        })
        .catch((err) => {
          return res.status(400).json({
            success: false,
            data: { error: err },
          });
        });
    } catch (error) {
      return res.status(404).send({
        success: false,
        data: { error: error.response },
      });
    }
  },
};

module.exports = otpController;
