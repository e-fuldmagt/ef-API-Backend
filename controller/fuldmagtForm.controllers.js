const jwt = require("jsonwebtoken");
const fuldmagtFormServices = require("../services/fuldmagtForm.services");
const { dataResponse } = require("../utils/responses");
const { uploadFileObjectToFirebase } = require("../services/Firebase_SignStorage");

const fuldmagtFormController = {
  // ----------------- register FuldmagtForm By User -----------------
  async addFuldmagtForm(req, res) {

    let icon_Object = req.files.icon;
    let fuldmagt_Object = req.files.fuldmagt_image;

    let {title, additionalFields, additionalFieldsType, additionalFieldsObject,
      isAgentSignRequired, fuldmagtStatement, purchaseType} = req.body;
    
    let fuldmagtForm = await fuldmagtFormServices.createFuldmagtForm({
      title, additionalFields, additionalFieldsType, additionalFieldsObject,
      isAgentSignRequired, fuldmagtStatement, purchaseType, icon_Object, fuldmagt_Object
    });

    return res.status(200).send(dataResponse("Fuldmagt Form has been created", {fuldmagtForm}))
  },

  // ......................update fuldmagtForm  By User.............................
  async updateFuldmagtForm(req, res) {
    
  },
  // .................. get fuldmagtForm .............................
  async getFuldmagtForms(req, res){
    let fuldmagtForms = await fuldmagtFormServices.getFuldmagtForms();

    return res.status(200).send(dataResponse("Fuldmagt Froms has been retrieved", {fuldmagtForms}))
  },
  // ---------------Query Companies---------------------------
  async getSpecificFuldmagtForm(req, res) {
  },     
  // ---------------Add FuldmagtForm Unverified--------------------// This is just for testing and may be later useful for admin panel//
  async deleteFuldmagtForm(req, res){
      let {fuldmagtFormId} = req.params;

      let fuldmagtForm = await fuldmagtFormServices.addFuldmagtFormUnverified(userId, email, phone, fuldmagtFormName, address, cvr);

      let authToken = jwt.sign({userId: user._id, fuldmagtFormId: registeredFuldmagtForm?registeredFuldmagtForm._id:null}, process.env.AUTHORIZATION_TOKEN, {expiresIn: "15m"});

      return res.status(200).send(dataResponse("FuldmagtForm has been added successfully", {authToken: authToken, fuldmagtForm: registeredFuldmagtForm}));
  },
  async getFuldmagtFormsByUser(req, res){
     let userId = req.user;

     let fuldmagtForms = await fuldmagtFormServices.getFuldmagtFormsByUser(userId);

     return res.status(200).send(dataResponse("Fuldmagt Forms has been retrieved", {fuldmagtForms}))
  },
};

module.exports = fuldmagtFormController;
