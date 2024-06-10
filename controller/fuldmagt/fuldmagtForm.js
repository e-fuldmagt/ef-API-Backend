const Fuldmagt = require("../../models/fuldmagtForm");

const fuldmagtController = {

  // ......................add form .............................
  async addForm(req, res, next) {
    try {
      let {title, visibility} = req.body;
      const form = req.fileUrl;

      let fuldmagt = {
        title , visibility, form
      }

      let fuldmagtForm = new Fuldmagt(fuldmagt);

      // save form
      fuldmagtForm.save((err, registeredCompany) => {
        if (err) {
          return res.status(400).send({
            success: false,
            data: { error: err.message },
          });
        } else {
          return res.status(200).send({
            success: true,
            data: {
              message: "Form added successfully",
            },
          });
        }
      });
      
    } catch (error) {
      res.status(500).send({ success: false, data: { error: "Server Error" } });
    }
  },

};

module.exports = fuldmagtController;
