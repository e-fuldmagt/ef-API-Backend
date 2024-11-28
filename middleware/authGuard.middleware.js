const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");

//function to verify authentication
function authGuard (req, res, next) {
  try{
    const token = req.header("Authorization");

    if (!token) {
      throw createHttpError.Unauthorized("Token doesn't exist")
    } else {
      try {
        const jwtToken = token.split(' ')[1];
        const verified = jwt.verify(jwtToken, process.env.AUTHORIZATION_TOKEN);
        req.user = verified.userId;
        req.company = verified.companyId;
        next();
      } catch (err) {
        throw createHttpError.BadRequest("Invalid Token")
      }
    }
  }
  catch(err){
    next(err)
  }
}
module.exports = authGuard
