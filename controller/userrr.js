const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
 
  //........................api to log in .......................
  async login(req, res) {
    try {
      const userData = req.body;
      const user = new User(userData);
      const founduser = await User.findOne({
        email: userData.email,
        isGuest: false,
      });

      if (!founduser) {
        res
          .status(400)
          .send({ success: false, data: { error: "user donot exists" } });
      } else {
        const validPass = await bcrypt.compare(
          user.password,
          founduser.password
        );
        if (!validPass) {
          res
            .status(400)
            .send({ success: false, data: { error: "Wrong password" } });
        } else {
          const token = jwt.sign(
            { _id: founduser._id },
            process.env.TOKEN_SECRET
          );
          res.status(200).send({
            success: true,
            data: {
              message: "logged in successfully",
              authToken: token,
              name: founduser.name,
              email: founduser.email,
              _id: founduser._id,
            },
          });
        }
      }
    } catch (err) {
      return res.status(500).send({
        success: false,
        data: { error: "Some Error Occurred" },
      });
    }
  },

  // ----------------- api to change password -----------------
  async changePassword(req, res) {
    const id = req.params.id
    let {oldPassword, newPassword } = req.body;

    try {
      const founduser = await User.findOne({
        _id: id,
      });

      if (!founduser) {
        return res.status(404).send({
          success: false,
          data:{error: "user with this id not found"},
        });
      } else {
        const validPass = await bcrypt.compare(oldPassword, founduser.password);

        if (!validPass) {
          return res.status(404).send({
            success: false,
            data:{error: "Old password is in correct"},
          });
        } else {
          // Hash the password
          const salt = await bcrypt.genSalt(10);
          newPassword = await bcrypt.hash(newPassword, salt);

          const updatedPassword = await User.findOneAndUpdate(
            { _id: id },
            { password: newPassword }
          );
          if (updatedPassword) {
            return res.status(200).send({
              success: true,
              data:{message: "password updated successfully"}
            });
          } else {
            return res.status(404).send({
              success: false,
              data:{error: "Some error occured"},
            });
          }
        }
      }
    } catch (err) {
      res.status(404).send({
        success: false,
        data:{error: err || "credentials not match"},
      });
    }
  },


  //........................api to edit user .......................

  async editUser(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res
          .status(400)
          .send({ success: false, data: { error: "User doesn't exist" } });
      } else {
        let userExist = await User.findOne({ email: req.body.email });
        if (userExist && userExist._id != id) {
          return res.status(400).send({
            success: false,
            data: {
              error:
                "You cannot use this email user with this email already exists",
            },
          });
        } else {
          let user = await User.findOneAndUpdate({ _id: id }, req.body)
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
      }
    } catch (error) {
      // Handle any unexpected errors
      res.status(500).send({
        success: false,
        data: { error: "Server Error" },
      });
    }
  },
 
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