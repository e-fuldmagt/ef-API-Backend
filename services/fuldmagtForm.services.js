const jwt = require("jsonwebtoken")
const notificationServices = require("./notification.services")
const { sendEmail } = require("./MailService")
const mongoose = require("mongoose")
const FulmagtForm = require("../models/fuldmagtForm")
const fuldmagtFormRepository = require("../repositories/fuldmagtForm.repositories")

const fuldmagtFormServices = {
    async createFuldmagtForm({title, icon, additionalFields, additionalFieldsType, additionalFieldsObject,
        isAgentSignRequired, fuldmagtStatement, purchaseType
    }){
        let fulmagtForm = await fuldmagtFormRepository.createFuldmagtForm({title, icon, additionalFields, additionalFieldsType, additionalFieldsObject,
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