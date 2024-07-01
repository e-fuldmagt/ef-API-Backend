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

  // .................. get company .............................
  async getCompany(req, res) {
    try {
        const { id } = req.params;

        // Ensure the index is created on the email field
        await Company.createIndexes([{ key: { email: 1 }, unique: true }]);

        // Construct the query based on whether an ID is provided
        const query = id ? { _id: id, ...req.body } : { ...req.body };

        // Find the user(s) matching the query
        const result = await Company.find(query);

        // Handle the case where no user is found
        if (result.length == 0) {
          
            return res.status(404).send({
                success: false,
                data: { message: "Company not found" },
            });
        }

        // Respond with the found user(s)
        return res.status(200).send({
            success: true,
            data: {
                message: "Company found",
                user: result,
            },
        });
    } catch (error) {
        console.error(error);

        // Respond with a generic error message
        return res.status(500).send({
            success: false,
            data: { error: error.message },
        });
    }
},      

};

module.exports = companyController;
