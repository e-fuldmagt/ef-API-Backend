const createHttpError = require("http-errors");
const FuldmagtForm = require("../models/fuldmagtForm")
const mongoose = require("mongoose")
const fuldmagtFormRepository = {
    async createFuldmagtForm({title, icon, additionalFields, additionalFieldsType, additionalFieldsObject, isAgentSignRequired, purchaseType, fuldmagtStatement }){ //Will be expensive function
        let fuldmagtForm = new FuldmagtForm({title, icon, additionalFields, additionalFieldsType, additionalFieldsObject, 
            isAgentSignRequired, purchaseType, fuldmagtStatement })
        console.log(
            additionalFields.length,
            additionalFieldsType.length,
            additionalFieldsObject
        )
        if(additionalFields.length != additionalFieldsType.length || additionalFieldsType.length !=additionalFieldsObject.length){
            throw createHttpError.BadRequest("Additionals fields are not correct");
        }

        for(let i = 0; i<additionalFields.length; i++){
            console.log(additionalFieldsType[i])
            if(
                (additionalFieldsType[i] == "headline" && additionalFieldsObject[i].text == undefined )|| 
                (additionalFieldsType[i] == "note" && additionalFieldsObject[i].text == undefined ) ||
                (additionalFieldsType[i] == "textField" && additionalFieldsObject[i].placeholder == undefined ) ||
                (additionalFieldsType[i] == "textArea" && additionalFieldsObject[i].placeholder == undefined ) ||
                (additionalFieldsType[i] == "radioButtons" && (additionalFieldsObject[i].heading == undefined || additionalFieldsObject[i].options == undefined )) ||
                (additionalFieldsType[i] == "checkBoxes" && (additionalFieldsObject[i].heading == undefined || additionalFieldsObject[i].options == undefined ))
            ){
                throw createHttpError.BadRequest("Additions Field Issue: "+additionalFields[i])
            }
            else if(
                additionalFieldsType[i] != "date" && additionalFieldsType[i] == "headline" &&
                additionalFieldsType[i] != "note" && additionalFieldsType[i] == "textField" &&
                additionalFieldsType[i] != "textArea" &&    additionalFieldsType[i] == "radioButtons" &&
                additionalFieldsType[i] != "checkBoxes" 
            ){
                throw createHttpError.BadRequest("Additional Fields type not valid")
            }
        }

        await fuldmagtForm.save();

        return fuldmagtForm;
    },
    async updateFuldmagtForm({title, icon, additionalFields, additionalFieldsType, additionalFieldsObject, 
        isAgentSignRequired, purchaseType, fuldmagtStatement }){ //Will be expensive function
        let fuldmagtForm = new FuldmagtForm({title, icon, additionalFields, additionalFieldsType, additionalFieldsObject, 
            isAgentSignRequired, purchaseType, fuldmagtStatement })

        if(additionalFields.length != additionalFieldsType.length || additionalFieldsType.length !=additionalFieldsObject){
            throw createHttpError.BadRequest("Additionals fields are not correct");
        }

        for(let i = 0; i<additionalFields.length; i++){
            if(
                (additionalFieldsType[i] == "headline" && additionalFieldsObject[i].text == undefined )|| 
                (additionalFieldsType[i] == "note" && additionalFieldsObject[i].text == undefined ) ||
                (additionalFieldsType[i] == "textField" && additionalFieldsObject[i].placehodler == undefined ) ||
                (additionalFieldsType[i] == "textArea" && additionalFieldsObject[i].placehodler == undefined ) ||
                (additionalFieldsType[i] == "radioButton" && (additionalFieldsObject[i].heading == undefined || additionalFieldsObject[i].options == undefined )) ||
                (additionalFieldsType[i] == "checkBoxes" && (additionalFieldsObject[i].heading == undefined || additionalFieldsObject[i].options == undefined ))
            ){
                throw createHttpError.BadRequest("Additions Field Issue: ", additionalFields[i])
            }
        }

        await fuldmagtForm.save();

        return fuldmagtForm;
    },
    async getFuldmagtForms(){
        let fuldmagtForms = await FuldmagtForm.find({});


        return fuldmagtForms
    },
    async getSpecificFuldmagtForm(){

    },
    async deleteFuldmagtForm(){

    },
    async getFuldmagtFormsByUser(userId){
        const userObjectId = mongoose.Types.ObjectId(userId);

        const pipeline = [
        {
            $match: {
                $expr: {
                    $or: [
                    // Case 1: exceptUsers is false and userId is in selectedUsers
                    {
                        $and: [
                        { $eq: ["$exceptUsers", false] },
                        { $in: [userObjectId, "$selectedUsers"] }
                        ]
                    },
                    // Case 2: exceptUsers is true and userId is not in selectedUsers
                    {
                        $and: [
                        { $eq: ["$exceptUsers", true] },
                        { $not: { $in: [userObjectId, "$selectedUsers"] } }
                        ]
                    }
                    ]
                }
            }
        }
        ]
        let fuldmagtForms = await FuldmagtForm.aggregate(pipeline);

        return fuldmagtForms;
    },
    async getSpecificFuldmagtFormByUser(userId, fuldmagtId){
        const userObjectId = mongoose.Types.ObjectId(userId);
        const fuldmagtObjectId = mongoose.Types.ObjectId(fuldmagtId);
        const pipeline = [
        {
            $match: {
                "_id": fuldmagtObjectId
            }
        },
        {
            $match: {
                $expr: {
                    $or: [
                    // Case 1: exceptUsers is false and userId is in selectedUsers
                    {
                        $and: [
                        { $eq: ["$exceptUsers", false] },
                        { $in: [userObjectId, "$selectedUsers"] }
                        ]
                    },
                    // Case 2: exceptUsers is true and userId is not in selectedUsers
                    {
                        $and: [
                        { $eq: ["$exceptUsers", true] },
                        { $not: { $in: [userObjectId, "$selectedUsers"] } }
                        ]
                    }
                    ]
                }
            }
        }
        ]
        let fuldmagtForms = await FuldmagtForm.aggregate(pipeline);

        let fuldmagtForm = (fuldmagtForms.length > 0)?fuldmagtForms[0]:null;

        return fuldmagtForm;
    }
}

module.exports = fuldmagtFormRepository