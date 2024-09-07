const express = require("express");
const userRouter = require("./user");
const companyRouter = require("./company");
const fuldmagtRouter = require("./fuldmagt");

const packageRouter = require("./package/package");
const signPackageRouter = require("./package/signPackage");
const tokenRouter = require("./token");
const adminRouter = require("./admin");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello from server");
});

router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/admin", adminRouter)
router.use("/fuldmagt", fuldmagtRouter);
router.use("/package", packageRouter);

router.use("/signPackage", signPackageRouter);
router.use("/token", tokenRouter);

module.exports = router;

