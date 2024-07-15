const Package = require("../../models/package");

const signatureController = {

  // ......................add Signature .............................
  async addSignature(req, res, next) {
    try {
      const id = req.params.id;
      const signature = req.fileUrl;

      const packageExists = await Package.findOne({ _id: id });

      if (!packageExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "Package doesn't exist" } });
      } else {
        await Package.findOneAndUpdate(
          { _id: id },
          { $set: { signature: signature } },
          { new: true }
        )
          .then((result) => {
            return res.status(200).send({
              success: true,
              data: { message: "Package Signed successfully",
                package_id:result._id,
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

  
};

module.exports = signatureController;
