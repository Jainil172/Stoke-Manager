const { Router } = require("express");
const { query } = require("express-validator");
const { validate } = require("../utils/validate");
const { pdf, csv } = require("../controllers/report.controller");

const router = Router();

const scopeQuery = [
  query("scope")
    .optional()
    .isIn(["catalog", "stock-in", "stock-out"])
    .withMessage("scope must be one of: catalog, stock-in, stock-out."),
];

router.get("/pdf", validate(scopeQuery), pdf);
router.get("/csv", validate(scopeQuery), csv);

module.exports = router;
