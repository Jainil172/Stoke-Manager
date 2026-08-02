const { Router } = require("express");
const { body, query } = require("express-validator");
const { validate } = require("../utils/validate");
const { stockIn, stockOut, history } = require("../controllers/inventory.controller");

const router = Router();

const movementBody = [
  body("productId")
    .notEmpty()
    .withMessage("Product is required.")
    .isInt({ min: 1 })
    .withMessage("Product id must be a positive integer."),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer."),
  body("referenceNumber")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Reference number must be at most 100 characters."),
  body("notes")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be at most 500 characters."),
];

router.post(
  "/stock-in",
  validate(movementBody),
  stockIn
);

router.post(
  "/stock-out",
  validate(movementBody),
  stockOut
);

router.get(
  "/history",
  validate([
    query("productId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("productId must be a positive integer."),
    query("type")
      .optional()
      .isIn(["stock-in", "stock-out"])
      .withMessage("type must be either 'stock-in' or 'stock-out'."),
  ]),
  history
);

module.exports = router;
