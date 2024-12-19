const jwt = require("jsonwebtoken")
const notificationServices = require("./notification.services")
const { sendEmail } = require("./MailService")
const mongoose = require("mongoose")
const FulmagtForm = require("../models/fuldmagtForm")
const fuldmagtFormRepository = require("../repositories/fuldmagtForm.repositories")
const { uploadFileObjectToFirebaseByAdmin } = require("./Firebase_SignStorage")

const priceTiersDKK = {
    'Tier 1': 9,
    'Tier 3': 17,
    'Tier 5': 25,
    'Tier 7': 35,
    'Tier 10': 45,
    'Tier 12': 59,
    'Tier 14': 69,
    'Tier 16': 79,
    'Tier 18': 89,
    'Tier 20': 99,
    'Tier 30': 149,
    'Tier 40': 199,
    'Tier 50': 249,
    'Tier 60': 299,
    'Tier 80': 399,
    'Tier 100': 499,
    'Tier 120': 599,
    'Tier 140': 699,
    'Tier 160': 799,
    'Tier 200': 999
};

const fuldmagtFormServices = {
    async createFuldmagtForm({title, additionalFields, additionalFieldsType, additionalFieldsObject,
        isAgentSignRequired, fuldmagtStatement, purchaseType, icon, fuldmagt_Object, exceptUsers, exceptCompanies, selectedUsers, selectedCompanies
    }){
        const tiers = Object.keys(priceTiersDKK);
        if(!tiers.includes(purchaseType)){
            throw new Error("Invalid purchase type")
        }

        let price = priceTiersDKK[purchaseType];

        let fuldmagt_image = await uploadFileObjectToFirebaseByAdmin(fuldmagt_Object)
        let fulmagtForm = await fuldmagtFormRepository.createFuldmagtForm({title, price, additionalFields, additionalFieldsType, additionalFieldsObject,
            isAgentSignRequired, fuldmagtStatement, purchaseType, icon, fuldmagt_image, exceptUsers, exceptCompanies, selectedUsers, selectedCompanies})

        

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