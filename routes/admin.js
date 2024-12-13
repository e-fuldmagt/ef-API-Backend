const express = require("express");
const userController = require("../controller/user/user");
const fuldmagtFormController = require("../controller/fuldmagtForm.controllers");
const { errorHandler } = require("../handlers/error.handlers");
const adminRouter = express.Router();

const {decode64FilesMiddleware } = require("../middleware/decode64.middleware");


//Users//
adminRouter.post('/users', userController.createUser)
adminRouter.delete('/users/:id', userController.deleteUser);


//Fuldmagt Forms//
adminRouter.post('/fuldmagt-forms',
    decode64FilesMiddleware(["icon", "fuldmagt_image"]),
    errorHandler(fuldmagtFormController.addFuldmagtForm));
adminRouter.get('/fuldmagt-forms', fuldmagtFormController.getFuldmagtForms);
adminRouter.get('/fuldmagt-forms/:id', fuldmagtFormController.getSpecificFuldmagtForm);
adminRouter.put('/fuldmagt-forms/:id', fuldmagtFormController.updateFuldmagtForm);
adminRouter.delete('/fuldmagt-forms/:id', fuldmagtFormController.deleteFuldmagtForm);

module.exports = adminRouter;