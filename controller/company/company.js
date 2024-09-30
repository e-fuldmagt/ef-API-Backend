const jwt = require("jsonwebtoken");
const Company = require("../../models/company");
const User = require("../../models/user");
const companyServices = require("../../services/company.services");
const cryptoJs = require("crypto-js");

const companyController = {
  async verifyCompanyCredentials(req, res, next){
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

      if(await companyServices.getCompanyByCredentials(otpTokenDecrypted.credentials)){
        return res.status(400).send({
          success: false,
          message: "Company already exists with given credentials"
        })
      }

      //getting equal make a jwt for making account//
      let credentialsToken = jwt.sign(otpTokenDecrypted.credentials, process.env.ADD_COMPANY_TOKEN);
      
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
  // ----------------- register Company -----------------
  async addCompany(req, res) {
    
    try {
      let userId = req.user;
      let {emailCredentialsToken, phoneCredentialsToken, companyName, address, cvr} = req.body;

      let companyData = {
        companyName,
        address,
        cvr
      }

      let user = await User.findById(req.user);

      if(!user){
        return res.status(400).send({
          "message": "User not found"
        })
      }

      if(user.company){
        return res.status(400).send({
          "success": false,
          "message": "Already a company exists at user account"
        })
      }

      let emailCredentials = jwt.verify(emailCredentialsToken, process.env.ADD_COMPANY_TOKEN);
      let phoneCredentials = jwt.verify(phoneCredentialsToken, process.env.ADD_COMPANY_TOKEN);
      if(!emailCredentials.email)
          return res.status(400).send({
            "success": false,
            "message": "email token not found"
        })
      if(!phoneCredentials.phone)
        return res.status(400).send({
          "success": false,
          "message": "phone number token not found"
      })
      
      companyData.email = emailCredentials.email;
      companyData.phone = phoneCredentials.phone;
      companyData.createdBy = user._id;
      let registeredCompany = new Company(companyData);

      user.company = registeredCompany._id;
      await registeredCompany.save();
      await user.save();
      let authToken = jwt.sign({userId: user._id, companyId: registeredCompany?registeredCompany._id:null}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "15m"});


      return res.status(200).send({
        success: true,
        data: {
          message: "Company added successfully",
          authToken: authToken,
          company: registeredCompany
        },
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        data: { error: err.message },
      });
    }
  },

  // ......................update company .............................
  async updateCompany(req, res, next) {
    try {
      const id = req.company;

      let companyExists = await Company.findOne({ _id: id });
      
      let {address} = req.body;

      if (!companyExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "Company doesn't exist" } });
      } else {
        await Company.findOneAndUpdate({ _id: id }, {address}, {new: true})
          .then((result) => {
            // Changed parameter name from res to result
            return res.status(200).send({
              success: true,
              message: "details updated successfully" ,
              data: {
                company: result
               },
              
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
  // .................. get company .............................
  async getSpecificCompany(req, res, next){
    try {
        const { id } = req.params;

        // Find the user(s) matching the query
        let company  = await Company.findById(id);
      
        // Handle the case where no user is found
        if(!company){
          return res.status(404).send({
            "success":false,
            "message": "Company with given id doesn't exist"
          })
        }

        // Respond with the found user(s)
        return res.status(200).send({
            success: true,
            message: "company found",
            data: {
                company: company,
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
  async getCompanies(req, res, next) {
    try{
      let query = req.query;
      let filteredCompanies = await companyServices.getCompanies(query);

      return res.status(200).send({
        success: true,
        data: {
          companies: filteredCompanies
        }
      })
    }
    catch (error) {

      // Respond with a generic error message
      return res.status(500).send({
          success: false,
          data: { error: error.message },
      });
    }
  },      
  async addCompanyUnverified(req, res, next){
    
    try {
      let {email, phone, companyName, address, cvr} = req.body;

      let companyData = {
        companyName,
        address,
        cvr,
        email,
        phone
      }

      let user = await User.findById(req.user);

      if(!user){
        return res.status(400).send({
          "message": "User not found"
        })
      }

      if(user.company){
        return res.status(400).send({
          "success": false,
          "message": "Already a company exists at user account"
        })
      }

      companyData.createdBy = user._id;
      
      let registeredCompany = new Company(companyData);
      user.company = registeredCompany._id;
      
      await registeredCompany.save();
      await user.save();

      let authToken = jwt.sign({userId: user._id, companyId: registeredCompany?registeredCompany._id:null}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "15m"});


      return res.status(200).send({
        success: true,
        data: {
          message: "Company added successfully",
          authToken: authToken,
          company: registeredCompany
        },
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        data: { error: err.message },
      });
    }
  },
  async assignCompany(req, res, next){
    try{
      let companyId = req.params.id;
      let userId = req.user;

      let user = await User.findById(userId);
      if(!user)
        return res.status(404).send({
          "message": "User not found"
        });
      
      if(user.company)
        return res.status(400).send({
          "message": "User has already been assigned a company"
        });
      
      let company = await Company.findById(companyId);

      if(!company)
        return res.status(404).send({
          "message": "Company not found with given id"
        })
      
      user.company = company._id;

      await user.save();

      return res.status(200).send({
        message: "company has been assigned successfully",
        data: {
          company: company
        }
      })
    }
    catch(err){
      return res.status(500).send({
        success: false,
        data: { error: err.message },
      }); 
    }
  }
};

module.exports = companyController;
