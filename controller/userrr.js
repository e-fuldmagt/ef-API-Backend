const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
 
  //........................api to get all users .......................
  async getUsers(req, res) {
    try {
      let user = await User.find()
        .then((result) => {
          let users = [];
          result.map((val, ind) => {
            role = "";
            if (val.isGuest == true) {
              role = "Guest";
            } else {
              role = "Customer";
            }

            let userr = {
              name: val.name,
              email: val.email,
              phone: val.phone,
              role,
              image: role.image,
              isSelected: false,
            };
            users.push(userr);
          });
          return res.status(200).send({
            success: true,
            data: { message: "details updated successfully", user: users },
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ success: false, data: { error: err.message } });
        });
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: "Server Error" },
      });
    }
  },

  
  //........................api to delete user .......................
  async deleteUser(req, res) {
    const _id = req.params.id;
    try {
      let user = await User.findOneAndDelete({ _id });
      if (user) {
        // Changed parameter name from res to result
        return res.status(200).send({
          success: true,
          data: { message: "User deleted successfully" },
        });
      } else {
        return res
          .status(400)
          .send({ success: false, data: { error: "User not found" } });
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

module.exports = userController;