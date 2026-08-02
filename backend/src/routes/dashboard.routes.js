const { Router } = require("express");
const { dashboard, analytics } = require("../controllers/dashboard.controller");

const router = Router();

router.get("/", dashboard);
router.get("/analytics", analytics);

module.exports = router;
