const express = require("express");
const userRouter = require("./user");
const companyRouter = require("./company");
const fuldmagtRouter = require("./fuldmagt");

const signPackageRouter = require("./package/signPackage");
const adminRouter = require("./admin");
const packageRouter = require("./package");

const router = express.Router();

router.use("*", (req, res, next)=>{
  console.log("path:", req.baseUrl);
  next();
})

router.get("/", (req, res) => {
  res.send("e-fuldmagt backend server");
});

router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/admin", adminRouter)
router.use("/fuldmagt", fuldmagtRouter);
router.use("/package", packageRouter);

module.exports = router;

