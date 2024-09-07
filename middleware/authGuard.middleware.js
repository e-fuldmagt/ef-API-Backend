const jwt = require("jsonwebtoken");

//function to verify authentication
function authGuard (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    res.status(401).send("Access Denied");
  } else {
    try {
      const jwtToken = token.split(' ')[1];
      const verified = jwt.verify(jwtToken, process.env.AUTHORIZATION_TOKEN);
      req.user = verified.userId;
      req.company = verified.companyId;
      next();
    } catch (err) {
      res.status(400).send("Invalid Token");
    }
  }
}
module.exports = authGuard
