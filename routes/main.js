const express = require("express");
const userRouter = require("./user");
const companyRouter = require("./company");
const fuldmagtRouter = require("./fuldmagt");
const adminRouter = require("./admin");
const { invalidPathHandler, errorResponder, assignHTTPError } = require("../middleware/error.middleware");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("e-fuldmagt backend server");
});

router.use("/user", userRouter);
router.use("/company", companyRouter);
router.use("/admin", adminRouter)
router.use("/fuldmagt", fuldmagtRouter);

router.use(assignHTTPError)
router.use(errorResponder);
router.use(invalidPathHandler)
module.exports = router;

