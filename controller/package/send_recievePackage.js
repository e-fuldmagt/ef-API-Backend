const Package = require("../../models/package");
const User = require("../../models/user");
const Company = require("../../models/company");

const packageController = {
  // ----------------- register Package -----------------
  async addPackage(req, res) {
    try {
      let packageData = req.body;

      // Add package
      let package = new Package(packageData);
      package.save((err, Package) => {
        if (err) {
          return res.status(400).send({
            success: false,
            data: { error: err.message },
          });
        } else {
          return res.status(200).send({
            success: true,
            data: {
              message: "Package added successfully",
              package_id:Package._id
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

   // ......................update package .............................
   async updatePackage(req, res, next) {
    try {
      const id = req.params.id;

      let packageExists = await Package.findOne({ _id: id });

      if (!packageExists) {
        return res
          .status(400)
          .send({ success: false, data: { error: "Package doesn't exist" } });
      } else {
        await Package.findOneAndUpdate({ _id: id }, req.body)
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


  // .................. get package .............................
  async getPackage(req, res) {
    try {
        const { id } = req.params;

        // Construct the query based on whether an ID is provided
        const query = id ? { _id: id, ...req.body } : { ...req.body };

        // Find the user(s) matching the query
        const result = await Package.find(query);

        // Handle the case where no user is found
        if (result.length == 0) {
          
            return res.status(404).send({
                success: false,
                data: { message: "Package not found" },
            });
        }

        // Respond with the found user(s)
        return res.status(200).send({
            success: true,
            data: {
                message: "Package found",
                packages: result,
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

// get user package

// get user package

// get user package

async getUserPackage(req, res) {
    try {
        const { id } = req.params;

        // Construct the query based on whether an ID is provided
        const query = {
            $or: [
                { user: id },
                { reciever: id }
            ]
        };

        // Find the user(s) matching the query
        let result = await Package.find(query);

        // Handle the case where no user is found
        if (result.length === 0) {
            return res.status(404).send({
                success: false,
                data: { message: "Package not found" },
            });
        }

        // Iterate over the result array and update the reciever field
        for (let val of result) {
            let reciever = val.reciever;

            if (reciever) {
                if (val.recieverAccount === 'user') {
                    reciever = await User.findById(reciever);
                } else if (val.recieverAccount === 'company') {
                    reciever = await Company.findById(reciever);
                }

                // Update the reciever field with the fetched reciever details
                val.reciever = reciever;
            }
        }

        console.log("Updated result:", result);

        // Respond with the updated result
        return res.status(200).send({
            success: true,
            data: {
                message: "Package found",
                packages: result,
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
}


};

module.exports = packageController;
