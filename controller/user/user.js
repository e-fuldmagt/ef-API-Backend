const User = require("../../models/user");
const Joi = require("@hapi/joi");
const Otp = require("../../models/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const otpGenerator = require("otp-generator");
const mailService = require("../../services/MailService");

const { userSchema } = require("../../validation/userValidation");
const { passwordSchema } = require("../../validation/passwordSchema");

// Define Joi schema for email validation
const emailSchema = Joi.string().email().required();

const userController = {
  // ----------------- register User -----------------
  async registerUser(req, res) {
    try {
      const { email, phone } = req.body;
      let userData = req.body;

      const { error } = userSchema.validate(userData);
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
          // phone,
          emailVerification: true,
          // numberVerification: true,
        });

        if (verifiedUser) {
          // check is user already exists
          const phoneExists = await User.findOne({
            $or: [
              { phone }, // Check if phone number exists
              { email }, // Check if email exists
            ],
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

  // ----------------- create User without verification (for company) -----------------
  async createUser(req, res) {
    try {
      let userData = req.body;

      const { error } = userSchema.validate(userData);
      if (error) {
        // Return validation errors
        return res.status(400).json({
          success: false,
          data: { error: error.details.map((detail) => detail.message) },
        });
      } else {
        if (phoneExists) {
          res.status(400).send({
            success: false,
            data: { error: "User with this phone number already exists" },
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const hash_Password = await bcrypt.hash(req.body.password, salt);
          userData.password = hash_Password;
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
      }
    } catch (error) {
      return res.status(404).send({
        success: false,
        data: { error: error.response },
      });
    }
  },

   // .................. get user .............................
   async getUser(req, res) {
    try {
        const { id } = req.params;

        // Ensure the index is created on the email field
        await User.createIndexes([{ key: { email: 1 }, unique: true }]);

        // Construct the query based on whether an ID is provided
        const query = id ? { _id: id, ...req.body } : { ...req.body };

        // Find the user(s) matching the query
        const result = await User.find(query);

        // Handle the case where no user is found
        if (result.length == 0) {
          
            return res.status(404).send({
                success: false,
                data: { message: "User not found" },
            });
        }

        // Respond with the found user(s)
        return res.status(200).send({
            success: true,
            data: {
                message: "User found",
                user: result,
            },
        });
    } catch (error) {
        console.error(error);

        // Respond with a generic error message
        return res.status(500).send({
            success: false,
            data: { error: error.message },
        });
    }
},      
  //...................... set password ..........
  async setPassword(req, res) {
    const { id } = req.params;
    const { password } = req.body;

    console.log("id..", id, "..password..", password);
    try {
      const { error } = passwordSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        console.log("Validation error:", error);
        // Return validation errors
        return res.status(400).json({
          success: false,
          data: { error: error.details.map((detail) => detail.message) },
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hash_Password = await bcrypt.hash(password, salt);
      await User.findOneAndUpdate({ _id: id }, { password: hash_Password })
        .then((result) => {
          return res.status(200).send({
            success: true,
            data: { message: "Password added successfully" },
          });
        })
        .catch((err) => {
          console.log("Error updating password:", err);
          return res
            .status(400)
            .send({ success: false, data: { error: err.message } });
        });
    } catch (error) {
      console.log("Unexpected error:", error);
      return res.status(500).send({
        success: false,
        data: { error: error.message },
      });
    }
  },


  //...................... set pin ..........
  async setPin(req, res) {
    const { id } = req.params;
    const { pin } = req.body;
  
    console.log("id..", id, "..pin..", pin);
    try {
      const { error } = passwordSchema.validate({ password: pin }, {
        abortEarly: false,
      });
  
      if (error) {
        console.log("Validation error:", error);
        // Return validation errors
        return res.status(400).json({
          success: false,
          data: { error: error.details.map((detail) => detail.message) },
        });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hash_Pin = await bcrypt.hash(pin, salt);
  
      // Check if the hashed PIN already exists
      const existingUser = await User.findOne({ plainPin: pin });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          data: { error: "This PIN is already in use by another user." },
        });
      }
  
      // Update the user's PIN
      await User.findOneAndUpdate({ _id: id }, { pin: hash_Pin,  plainPin: pin })
        .then((result) => {
          return res.status(200).send({
            success: true,
            data: { message: "Pin added successfully" },
          });
        })
        .catch((err) => {
          console.log("Error adding pin:", err);
          return res.status(400).send({ success: false, data: { error: err.message } });
        });
    } catch (error) {
      console.log("Unexpected error:", error);
      return res.status(500).send({
        success: false,
        data: { error: error.message },
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
// ----------------- login with pin -----------------
async loginWithPin(req, res) {
  try {
    const { pin } = req.params;
    let user = await User.findOne({ plainPin: pin, admin: false });
    if (!user) {
      res
        .status(400)
        .send({ success: false, data: { error: "User with this pin donot exist" } });
    } else if (user.locked || user.loginAttempt == 4) {
      res.status(400).send({
        success: false,
        data: {
          error: "This user is locked due to entring wrong password 4 times",
        },
      });
    } else {
      
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

  // ......................update user .............................
  async updateUser(req, res, next) {
    try {
      const id = req.params.id;

      let userExists = await User.findOne({ _id: id });

      if (!userExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "User doesn't exist" } });
      } else {
        await User.findOneAndUpdate({ _id: id }, req.body)
          .then((result) => {
            // Changed parameter name from res to result
            return res.status(200).send({
              success: true,
              data: { message: "details updated successfully" },
            });
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ success: false, data: { error: err.message } });
          });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: "Server Error" },
      });
    }
  },
};

module.exports = userController;
