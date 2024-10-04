const User = require("../../models/user");
const Company = require("../../models/company");
const Joi = require("@hapi/joi");
const Otp = require("../../models/otp");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const otpGenerator = require("otp-generator");
const mailService = require("../../services/MailService");

const { userSchema } = require("../../validation/userValidation");
const { passwordSchema } = require("../../validation/passwordSchema");
const userServices = require("../../services/user.services");
const { mobileLoginSchema, verifyDevicePinSchema, refreshTokenSchema } = require("../../schemas/users");

// Define Joi schema for email validation
const emailSchema = Joi.string().email().required();

const userController = {
  //------------------ upload profile pic-------------//
  async uploadProfileImage(req, res, next){
    try{
      let user = await User.findById(req.user);

      user.image = req.profileImageUrl;

      await user.save();

      return res.status(200).send({
        message: "Profile Image has been uploaded",
        data: {
          "profileImage": user.image
        }
      })
    }
    catch(err){
      return res.status(500).send({
        success: false,
        data: { error: err.message },
      });
    }
  },
  // ----------------- register User -----------------
  async registerUser(req, res) {
    try {
      const {emailCredentialsToken, phoneCredentialsToken, name, address, dateOfBirth} = req.body
      userObj = {
        name, address
      }

      if(dateOfBirth){
        userObj.dateOfBirth = new Date(dateOfBirth)
      }
      
      let resBody = await userServices.registerUser(emailCredentialsToken, phoneCredentialsToken, userObj);



      if(!resBody){
        return res.status(400).send({
          success: false,
          message: "Bad Request",
        });
      }
      res.status(200).send({
        success:true,
        data:{
          ...resBody
        }
      })
    } catch (error) {
      return res.status(500).send({
        success: false,
        data: { error: error.message },
      });
    }
  },
  async deactivateAccount(req, res, next){
    try{
      let userId = req.user;

      let user = await User.findById(userId);

      if(!user){
        return res.status(404).send({
          success:false,
          data: {error: "User not found"}
        })
      }

      user.deleted = true;

      await user.save();

      return res.status(200).send({
        success: true,
        message: "Account deactivated successfully",
        user: {...user.toObject(), pin:undefined}
      })

    }
    catch(e){
      return res.status(500).send({
        success: false,
        data: { error: e.message },
      });
    }
  },
  async deleteUser(req, res, next){
    try{
      let userId = req.params.id;

      let user = await User.findById(userId);

      if(!user){
        return res.status(400).send({
          success:false,
          data: {error: "User not found"}
        })
      }

      user.deleted = true;

      await user.save();

      return res.status(200).send({
        success: true,
        user: {...user.toObject(), pin:undefined}
      })

    }
    catch(e){
      return res.status(500).send({
        success: false,
        data: { error: e.message },
      });
    }
  },
  async createPassword(req, res){
    try{
      const {createPasswordToken, pin, deviceId} = req.body;
      
      resBody = await userServices.createPassword(createPasswordToken, deviceId, pin);

      if(!resBody){
        return res.status(400).send({
          success: false,
          message: "Bad Request",
        });
      }
      res.status(200).send({
        success:true,
        data:{
          ...resBody
        }
      })
    }catch(error){
      return res.status(500).send({
        success: false,
        data: { error: error.message },
      });
    }
  },

  async login(req, res, next){
    try{
      
      const {credentials, pin} = req.body;
      
      resBody = await userServices.login(credentials, pin);

      if(!resBody){
        return res.status(400).send({
          success: false,
          message: "Bad Request",
        });
      }
      res.status(200).send({
        success:true,
        data:{
          ...resBody
        }
      })
    }catch(error){
      return res.status(500).send({
        success: false,
        data: { error: error.message },
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
          const salt = await bcryptjs.genSalt(10);
          const hashPin = await bcryptjs.hash(req.body.pin, salt);
          userData.pin = hashPin;
          // add user
          let userCreated = null;
          try{
            userCreated = await userServices.addUser(userData);
          }
          catch(e){
            return res.status(400).send({
              success: false,
              data: { error: e.message },
            });
          }
          
          return res.status(200).send({
            success:true,
            data: {
              user: {...userCreated}
            }
          })
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        data: { error: error.message },
      });
    }
  },
  async getUsers(req, res, next){
    try{
      let query = req.query;
      let filteredUsers = await userServices.getUsers(query);

      return res.status(200).send({
        success: true,
        data: {
          users: filteredUsers
        }
      })
    }
    catch (error) {

      // Respond with a generic error message
      return res.status(500).send({
          success: false,
          data: { error: error.message },
      });
  ``}
  },
   // .................. get user .............................
   async getUser(req, res) {
    try {
        const { id } = req.params;

        // Find the user(s) matching the query
        let user  = await User.findById(id);
        let company = null;
        if(user.company){
          company = await Company.findById(user.company);
        }

        // Handle the case where no user is found
        if(!user){
          return res.status(404).send({
            "success":false,
            "message": "User with given id doesn't exist"
          })
        }

        // Respond with the found user(s)
        return res.status(200).send({
            success: true,
            data: {
                message: "User found",
                user: {...user.toObject(), pin: undefined},
                company
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
    const id = req.user;
    const { oldPin, newPin } = req.body;
    try {
      let user = await User.findById(id);
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
      
      if(!bcryptjs.compareSync(oldPin, user.pin)){
        return res.status(400).json({
          success: false,
          data: { error: "Old Pin doesn't match" },
        });
      }

      const salt = await bcryptjs.genSalt(10);
      const hash_Password = await bcryptjs.hash(newPin, salt);
      user.pin = hash_Password;
      await user.save();
      return res.status(200).send({
        success: true,
        message: "Password has been changed successfully"
      })
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
  
      const salt = await bcryptjs.genSalt(10);
      const hash_Pin = await bcryptjs.hash(pin, salt);
  
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

  //...................... re-set pin ..........
  async reSetPin(req, res) {
    const { email, pin } = req.body;
  
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
  
      const salt = await bcryptjs.genSalt(10);
      const hash_Pin = await bcryptjs.hash(pin, salt);
  
      // Check if the hashed PIN already exists
      const existingUser = await User.findOne({ plainPin: pin });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          data: { error: "This PIN is already in use by another user." },
        });
      }
  
      // Update the user's PIN
      await User.findOneAndUpdate({ email }, { pin: hash_Pin,  plainPin: pin })
        .then((result) => {
          return res.status(200).send({
            success: true,
            data: { message: "Pin reset successfully" },
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
      const matchPass = await bcryptjs.compare(confirmPassword, user.password);
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
      const { credentials, pin } = req.body;
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
        const matchPass = await bcryptjs.compare(password, user.password);
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
        const salt = await bcryptjs.genSalt(10);
        let hashedOtp = await bcryptjs.hash(new_otp, salt);

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
      const userId = req.user;

      let user = await User.findById(userId);

      if (!user) {
        return res.status(404)
          .send({ success: false, data: { error: "User doesn't exist" } });
      }
      delete req.body.email;
      delete req.body.phone;
      let updatedUser = await User.findOneAndUpdate({ _id: userId }, req.body, {new: true})
      
      res.status(200).send({
        success: "true",
        message: "User has been updated successfully",
        data: {updatedUser, pin:undefined}
      })
          
    } catch (error) {
      console.log(error);
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: "Server Error" },
      });
    }
  },
  async mobileLogin(req, res, next){
    try{
      let validate = mobileLoginSchema.validate(req.body);

      if(validate.error){
        return res.status(400).send({
          "success": true,
          "message": validate.error.message
        })
      }

      let {credentials, pin, deviceId} = req.body;
      console.log(credentials)
      //Use Body Schema Here//
      let user = await userServices.getUserByCredentials(credentials);

      if(!user){
          return res.status(404).send({
            "success": false, 
            "message": "User with given credentials doesn't exist"
          })
      }
      
      if(user.deleted){
        return res.status(400).send({
          "success": false, 
          "message": "User with given credentials is deleted"
        })
      }

      if(user.deviceId && user.deviceId!= deviceId){
        return res.status(400).send({
          "success": false,
          "message": "User has already been registered on another device Id,"
        })
      }

      //Matching Password//
      if(!(await bcryptjs.compare(pin, user.pin))){
        return res.status(400).send({
          "success": false,
          "message": "Credentials or Pin is not correct"
        })
      }

      

      user.deviceId = deviceId;

      let refreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN, {expiresIn: "30d"});

      user.refreshTokens.push(refreshToken);

      await user.save();

      //Check if user has a company//
      let company  = await Company.findById(user.company)

      let authToken = jwt.sign({userId: user._id, companyId: company?company._id:null}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "1h"});
      return res.status(200).send({
        success: "true",
        data: {authToken, refreshToken, user:{...user.toObject(), pin: undefined}, company: company?company.toObject():null}
      }
      ) ;
    }
    catch(e){
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: e.message },
      });
    }
  },
  async verifyDevicePin(req, res, next){
    try{
      let validate = verifyDevicePinSchema.validate(req.body);

      if(validate.error){
        return res.status(400).send({
          "success": true,
          "message": validate.error.message
        })
      }

      let {refreshToken, pin, deviceId} = req.body;
      
      //Use Body Schema Here//
      let refreshTokenPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

      let userId = refreshTokenPayload.userId;

      let user = await User.findOne({_id: userId, deviceId}).populate("company");
      

      if(!user){
          return res.status(404).send({
            "success": false,
            "message": "User with given credentials doesn't exist"
          })
      }

      if(user.refreshTokens.findIndex((rT)=> rT==refreshToken) == -1){
        return res.status(400).send({
          "success": false, 
          "message": "Session has expired, please login again"
        })
      }
      
      if(user.deleted){
        return res.status(400).send({
          "success": false, 
          "message": "User with given credentials is deleted"
        })
      }

      if(user.deviceId && user.deviceId!= deviceId){
        return res.status(400).send({
          "success": false,
          "message": "User has already been registered on another device Id"
        })
      }

      //Matching Password//
      if(!(await bcryptjs.compare(pin, user.pin))){
        return res.status(400).send({
          "success": false,
          "message": "Credentials or Pin is not correct"
        })
      }

      let authToken = jwt.sign({userId: user._id, companyId: user.company?user.company._id:null}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "1h"});

      return res.status(200).send({
        success: "true",
        data: {authToken, refreshToken, user:{...user.toObject(), pin: undefined, company: undefined}, company: user.company}
      }
      ) ;
    }
    catch(e){
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: e.message },
      });
    }
  },
  async logout(req, res, next){
    try{
      let {deviceId, refreshToken, notificationId} = req.body;

      let user = await User.findById(req.user);

      if(!user){
        return res.status(404).send({
          "message": "user doesn't exist with given id"
        })
      }

      if(deviceId != undefined && user.deviceId != deviceId){
        return res.status(404).send({
          "message": "device Id doesn't match"
        })
      }

      if(deviceId != undefined)
        user.deviceId = null;

      user.refreshTokens = user.refreshTokens.filter((rT)=>rT!=refreshToken);
      user.notificationIds = user.notificationIds.filter((nId)=>nId!=notificationId);
      
      await user.save()

      return res.status(200).send({
        "message": "user has been logged out successfully"
      })
    }
    catch(err){
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: e.message },
      });
    }
  },
  async verifyPassword(req, res, next){
    let {pin} = req.body;

    let userId = req.user;
    
    let user = await User.findById(userId);

    if(!user)
      return res.status(404).send({
        message: "User not found"
      })
    
    if(!(await bcryptjs.compare(pin, user.pin))){
      return res.status(400).send({
        "success": false,
        "message": "pin is not correct"
      })
    }

    return res.status(200).send({
      "success": true,
      "message": "Pin has been verified"
    })
  },
  async refreshTokenCall(req, res, next){
    try{
      let validate = refreshTokenSchema.validate(req.body);

      if(validate.error){
        return res.status(400).send({
          "success": true,
          "message": validate.error.message
        })
      }
      let {refreshToken} = req.body;
      
      console.log(refreshToken);
      let userId = req.user;
      let companyId = req.company;

      let user = await User.findOne({_id: userId});
      

      if(!user){
          return res.status(404).send({
            "success": false,
            "message": "User with given credentials doesn't exist"
          })
      }
      
      if(user.deleted){
        return res.status(400).send({
          "success": false, 
          "message": "User with given credentials is deleted"
        })
      }

      //Remove the Refresh Token from User//
      user.refreshTokens = user.refreshTokens.filter(rT => rT != refreshToken);

      let newRefreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN, {expiresIn: "30d"});

      user.refreshTokens.push(newRefreshToken);

      let authToken = jwt.sign({userId: user._id, companyId: companyId}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "1h"});

      
      await user.save();

      return res.status(200).send({
        success: "true",
        data: {authToken, refreshToken: newRefreshToken}}
      ) ;
    }
    catch(e){
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: e.message },
      });
    }
  }
};

module.exports = userController;
