const Company = require("../../models/company");

const signatureController = {

  // ......................add Signature .............................
  async addSignature(req, res, next) {
    try {
      const id = req.params.id;
      const signature = req.fileUrl;

      const companyExists = await Company.findOne({ _id: id });

      if (!companyExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "Company doesn't exist" } });
      } else {
        await Company.findOneAndUpdate(
          { _id: id },
          { $set: { signature: signature } },
          { new: true }
        )
          .then((result) => {
            return res.status(200).send({
              success: true,
              data: { message: "Details updated successfully",
                signature: result.signature
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
      res.status(500).send({ success: false, data: { error: "Server Error" } });
    }
  },

   // ......................get Signature .............................
   async getSignature(req, res, next) {
    try {
      const id = req.params.id;

      const companyExists = await Company.findOne({ _id: id });

      if (!companyExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "Company doesn't exist" } });
      } else if(companyExists.signature) {
            return res.status(200).send({
              success: true,
              data: { message: "Signatures Found", signature: companyExists.signature },
            });
      }
      else{
        return res
          .status(400)
          .send({ success: false, data: { error: "Signature not added yet" } });
      }
    } catch (error) {
      res.status(500).send({ success: false, data: { error: "Server Error" } });
    }
  },
};

module.exports = signatureController;
