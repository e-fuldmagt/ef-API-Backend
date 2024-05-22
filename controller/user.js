const User = require("../models/user");
const Joi = require("@hapi/joi");
const Otp = require("../models/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const otpGenerator = require("otp-generator");
const mailService = require("../services/MailService");

const accountSid = "ACfcb9da3700c2632b98d2c9dbd6ebd3d3";
const authToken = "5e5c1a2d02929d0b6d09c31535fbd03b";
const client = require("twilio")(accountSid, authToken);

const { userSchema } = require("../validation/userValidation");

// Define Joi schema for email validation
const emailSchema = Joi.string().email().required();

const passwordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])"))
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one special character, and one number",
      "any.required": "Password is required",
    }),
});

const userController = {
  // ......................send otp .............................
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
          console.log("error is", err);
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

  // ----------------- register User -----------------
  async registerUser(req, res) {
    try {
      const { email, phone } = req.body;
      let userData = req.body;

      const { error } = userSchema.validate(userData);
      console.log("error is", error);
      if (error) {
        // Return validation errors
        return res.status(400).json({
          success: false,
          data: { error: error.details.map((detail) => detail.message) },
        });
      } else {
        // check if number and email is verfied
        const verifiedUser = await Otp.findOne({
          email,
          phone,
          emailVerification: true,
          numberVerification: true,
        });

        if (verifiedUser) {
          // check is user already exists
          const phoneExists = await User.findOne({
            phone,
          });
          if (phoneExists) {
            res.status(400).send({
              success: false,
              data: { error: "This user already exists" },
            });
          } else {
            // add user
            let user = new User(userData);
            user.save((error, registereduser) => {
              if (error) {
                res.status(400).send({
                  success: false,
                  data: { error: error.message },
                });
              } else {
                const token = jwt.sign(
                  { _id: registereduser._id },
                  process.env.TOKEN_SECRET
                );
                res.status(200).send({
                  success: true,
                  data: {
                    message: "user added successfully",
                    authToken: token,
                    name: registereduser.name,
                    email: registereduser.email,
                    _id: registereduser._id,
                  },
                });
              }
            });
          }
        } else {
          return res.status(404).send({
            success: false,
            data: { error: "User not verified" },
          });
        }
      }
    } catch (error) {
      return res.status(404).send({
        success: false,
        data: { error: error.response },
      });
    }
  },

  // ----------------- set Password -----------------
  async setPassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const { error } = passwordSchema.validate(req.body, {
        abortEarly: false,
      });

      console.log("in set password", error, password, id);

      if (error) {
        // Return validation errors
        return res.status(400).json({
          success: false,
          data: { error: error.details.map((detail) => detail.message) },
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash_Password = await bcrypt.hash(password, salt);
        await User.findOneAndUpdate({ _id: id }, { password: hash_Password })
          .then((result) => {
            // Changed parameter name from res to result
            return res.status(200).send({
              success: true,
              data: { message: "Password added successfully" },
            });
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ success: false, data: { error: err.message } });
          });
      }
    } catch (error) {
      return res.status(404).send({
        success: false,
        data: { error: error.response },
      });
    }
  },

  // ----------------- confirm password -----------------
  async confirmPassword(req, res) {
    try {
      const { id, confirmPassword } = req.params;
      let user = await User.findOne({ _id: id });
      const matchPass = await bcrypt.compare(confirmPassword, user.password);
      if (matchPass) {
        // Changed parameter name from res to result
        return res.status(200).send({
          success: true,
          data: { message: "Password matched" },
        });
      } else {
        return res
          .status(400)
          .send({ success: false, data: { error: "Incorrect password" } });
      }
    } catch (error) {
      return res.status(404).send({
        success: false,
        data: { error: error.response },
      });
    }
  },

  // ----------------- login -----------------
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email, admin: false });
      if (!user) {
        res
          .status(400)
          .send({ success: false, data: { error: "user donot exists" } });
      } else if (user.locked || user.loginAttempt == 4) {
        res.status(400).send({
          success: false,
          data: {
            error: "This user is locked due to entring wrong password 4 times",
          },
        });
      } else {
        console.log("in else");
        const matchPass = await bcrypt.compare(password, user.password);
        if (!matchPass) {
          if (user.loginAttempt >= 3) {
            await User.findOneAndUpdate({ email }, { locked: true });
          }
          if (!user.locked) {
            await User.findOneAndUpdate(
              { email },
              { loginAttempt: user.loginAttempt + 1 }
            );
          }
          let msg =
            "You have entered the wrong code. You have a total of 4 attempts before you get locked out. However, you can easily create a new code by pressing the “Forget code” button below.";
          if (user.loginAttempt == 3) {
            msg = "This user is locked due to entring wrong password 4 times";
          }
          res.status(400).send({ success: false, data: { error: msg } });
        } else {
          console.log("in else");
          await User.findOneAndUpdate({ email }, { loginAttempt: 0 });
          const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
          res.status(200).send({
            success: true,
            data: {
              message: "logged in successfully",
              authToken: token,
              _id: user._id,
            },
          });
        }
      }
    } catch (error) {
      return res.status(404).send({
        success: false,
        data: { error: error.response },
      });
    }
  },

  // ......................forget password .............................
  async forgetPassword(req, res, next) {
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

        if (!user) {
          return res.status(400).json({
            success: false,
            data: { error: "User with this email donot exist" },
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
            data: { message: "OTP Sent Successfully!", id: user._id },
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
};

module.exports = userController;
