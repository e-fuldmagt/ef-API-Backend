const jwt = require("jsonwebtoken");
const companyServices = require("../services/company.services");
const { dataResponse } = require("../utils/responses");

const companyController = {
  async verifyCompanyCredentials(req, res){
      const {otp, encryptedOTPToken} = req.body;
      
      let credentialsToken = await companyServices.verifyCompanyCredentials(otp, encryptedOTPToken);

      res.status(200).json(dataResponse("Company Credentials Verified Successfully", {credentialsToken}))
  },
  // ----------------- register Company By User -----------------
  async addCompanyByUser(req, res) {
      let userId = req.user;

      let {emailCredentialsToken, phoneCredentialsToken, companyName, address, cvr} = req.body;
    
      let {user, registeredCompany} = await companyServices.addCompanyByUser(userId, emailCredentialsToken, phoneCredentialsToken,
        companyName, address, cvr
      );

      user.company = registeredCompany._id;
      await user.save();
      let authToken = jwt.sign({userId: user._id, companyId: registeredCompany?registeredCompany._id:null}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "15m"});

      return res.status(200).send(dataResponse("Company has been added successfully", {authToken, company: registeredCompany}));
  },

  // ......................update company  By User.............................
  async updateCompanyByUser(req, res) {
    let companyId = req.company;
    let {address} = req.body;

    let company = await companyServices.updateCompanyByUser(companyId, address);

    return res.status(200).send(
        dataResponse("Company information has been updated successfully", {company})
    )
  },
  // .................. get company .............................
  async getSpecificCompany(req, res){
        const { id } = req.params;

        // Find the user(s) matching the query
        let company = await companyServices.getSpecificCompany(id);

        // Respond with the found user(s)
        return res.status(200).send(dataResponse("company has been successfully fetched", {company}));
  },
  // ---------------Query Companies---------------------------
  async getCompanies(req, res) {
      let query = req.query;

      let filteredCompanies = await companyServices.getCompanies(query);

      return res.status(200).send(dataResponse("companies has been successfully fetched", {companies: filteredCompanies}))
  },      
  // ---------------Add Company Unverified--------------------// This is just for testing and may be later useful for admin panel//
  async addCompanyUnverified(req, res){
      let userId = req.user;
      let {email, phone, companyName, address, cvr} = req.body;

      let {user, registeredCompany} = await companyServices.addCompanyUnverified(userId, email, phone, companyName, address, cvr);

      let authToken = jwt.sign({userId: user._id, companyId: registeredCompany?registeredCompany._id:null}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "15m"});

      return res.status(200).send(dataResponse("Company has been added successfully", {authToken: authToken, company: registeredCompany}));
  },
  //---------------Assign a company added to User which is already added-----------------------// Most Probably this functionality will be changed //
  async assignCompany(req, res){
      let companyId = req.params.id;
      let userId = req.user;

      let company = await companyServices.assignCompany(userId, companyId);

      return res.status(200).send(dataResponse("New company has been assigned", {company}))
  },

  //---------------------Company Signatures----------------------//
  async getCompanySignature(req, res){
    let companyId = req.params.id;

    let signature = await companyServices.getCompanySignature(companyId);

    return res.status(200).send(dataResponse("Company signature has been retrieved", {signature}))
  },
  //----------------------Update Signature---------------------//
  async updateCompanySignature(req, res){
    const companyId = req.company;
    const signature = req.fileUrl;

    let companySignature = await companyServices.updateCompanySignature(companyId, signature);

    return res.status(200).send(
      dataResponse("Signature has been updated successfully", {signature: companySignature})
    )
  }
};

module.exports = companyController;
