const User = require("../../models/user");

const signatureController = {
 
  async addSignature (req, res, next) {
    try {
      const id = req.params.id;
      const signature = req.fileUrl;
  
      const userExists = await User.findOne({ _id: id });
  
      if (!userExists) {
        return res.status(400).send({ success: false, data: { error: "User doesn't exist" } });
      } else {
        await User.findOneAndUpdate(
          { _id: id },
          { $set: { signature: signature } },
          { new: true }
        )
          .then((result) => {
            return res.status(200).send({
              success: true,
              data: { message: "Details updated successfully" },
            });
          })
          .catch((err) => {
            return res.status(400).send({ success: false, data: { error: err.message } });
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
  
        const userExists = await User.findOne({ _id: id });
  
        if (!userExists) {
          return res
            .status(400)
            .send({ success: false, data: { error: "User doesn't exist" } });
        } else if(userExists.signature) {
              return res.status(200).send({
                success: true,
                data: { message: "Signatures Found", signature: userExists.signature },
              });
        }else{
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
