const {getAccessToken} = require("../../services/fcm-notification/Generate_Token")

const notificationController = {

  // ......................add form .............................
  async getFcmToken(req, res, next) {
    try {
      const Token = getAccessToken()
      .then((result)=> {
        return res.status(200).send({
            success: true,
            data: {
              Token:"Bearer "+ result,
            },
          });
      })
      .catch((err)=>{
        console.log("token is", err)
        return res.status(404).send({
            success: false,
            data: {
              error:"Some error occured",
            },
          });
      })
      
      
    } catch (error) {
        console.log(error)
      res.status(500).send({ success: false, data: { error: "Server Error" } });
    }
  },

};

module.exports = notificationController;
