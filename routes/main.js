const express = require("express");
const userRouter = require("./user");
const companyRouter = require("./company");
const fuldmagtRouter = require("./fuldmagt");
const authGuard = require("../middleware/authGuard.middleware");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello from server");
});

router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/fuldmagt", fuldmagtRouter);

module.exports = router;

