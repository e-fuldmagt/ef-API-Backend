const Package = require("../../models/package");

const revokeController = {

  // ......................Revoke Package.............................
  async Revoke(req, res, next) {
    try {
      const id = req.params.id;
      let revokeDate = new Date()

      const packageExists = await Package.findOne({ _id: id });

      if (!packageExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "Package doesn't exist" } });
      } else {
        await Package.findOneAndUpdate(
          { _id: id },
          { $set: { revoke: true, revokeDate} },
          { new: true }
        )
          .then((result) => {
            return res.status(200).send({
              success: true,
              data: { message: "Package Signed successfully",
                package_id:result._id,
                revoke: result.revoke
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

module.exports = revokeController;
