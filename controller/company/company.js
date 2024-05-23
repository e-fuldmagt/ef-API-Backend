const Company = require("../../models/company");

const companyController = {
  // ----------------- register Company -----------------
  async addCompany(req, res) {
    try {
      let companyData = req.body;

      // Add company
      let company = new Company(companyData);
      company.save((err, registeredCompany) => {
        if (err) {
          return res.status(400).send({
            success: false,
            data: { error: err.message },
          });
        } else {
          return res.status(200).send({
            success: true,
            data: {
              message: "Company added successfully",
            },
          });
        }
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        data: { error: err.message },
      });
    }
  },

  // ......................update company .............................
  async updateCompany(req, res, next) {
    try {
      const id = req.params.id;

      let companyExists = await Company.findOne({ _id: id });

      if (!companyExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "Company doesn't exist" } });
      } else {
        await Company.findOneAndUpdate({ _id: id }, req.body)
          .then((result) => {
            // Changed parameter name from res to result
            return res.status(200).send({
              success: true,
              data: { message: "details updated successfully" },
            });
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ success: false, data: { error: err.message } });
          });
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: "Server Error" },
      });
    }
  },

};

module.exports = companyController;
