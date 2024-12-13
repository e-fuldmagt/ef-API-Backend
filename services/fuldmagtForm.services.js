const jwt = require("jsonwebtoken")
const notificationServices = require("./notification.services")
const { sendEmail } = require("./MailService")
const mongoose = require("mongoose")
const FulmagtForm = require("../models/fuldmagtForm")
const fuldmagtFormRepository = require("../repositories/fuldmagtForm.repositories")
const { uploadFileObjectToFirebaseByAdmin } = require("./Firebase_SignStorage")

const fuldmagtFormServices = {
    async createFuldmagtForm({title, additionalFields, additionalFieldsType, additionalFieldsObject,
        isAgentSignRequired, fuldmagtStatement, purchaseType, icon_Object, fuldmagt_Object
    }){
        let icon = await uploadFileObjectToFirebaseByAdmin(icon_Object)
        let fuldmagt_image = await uploadFileObjectToFirebaseByAdmin(fuldmagt_Object)
        let fulmagtForm = await fuldmagtFormRepository.createFuldmagtForm({title, icon, fuldmagt_image, additionalFields, additionalFieldsType, additionalFieldsObject,
            isAgentSignRequired, fuldmagtStatement, purchaseType})

        return fulmagtForm;
    },
    async getFuldmagtForms(){
        let fuldmagtForms = await fuldmagtFormRepository.getFuldmagtForms();

        return fuldmagtForms;
    },

    async getFuldmagtFormsByUser(userId){
        let fuldmagtForms = await fuldmagtFormRepository.getFuldmagtFormsByUser(userId);

        return fuldmagtForms
    },

    async getSpecificFuldmagtFormByUser(userId, fuldmagtId){
        let fuldmagtForm = await fuldmagtFormRepository.getSpecificFuldmagtForm(userId, fuldmagtId);

        return fuldmagtForm;
    }
}

module.exports = fuldmagtFormServices