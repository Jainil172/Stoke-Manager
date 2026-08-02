const { Router } = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../utils/validate");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/supplier.controller");

const router = Router();

const idParam = [param("id").isInt({ min: 1 }).withMessage("Supplier id must be a positive integer.")];

const companyName = (required) => [
  body("companyName")
    .if(required ? () => true : (value) => value !== undefined)
    .trim()
    .notEmpty()
    .withMessage(required ? "Company name is required." : "Company name cannot be empty.")
    .bail()
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be between 2 and 150 characters."),
];

const supplierFields = [
  body("contactPerson")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Contact person must be at most 100 characters."),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Phone must be at most 50 characters."),
  body("address")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address must be at most 500 characters."),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'."),
];

const supplierCreateBody = [...companyName(true), ...supplierFields];

const supplierUpdateBody = [...companyName(false), ...supplierFields];

router.get("/", list);

router.get("/:id", validate(idParam), getById);

router.post("/", validate(supplierCreateBody), create);

router.put("/:id", validate([...idParam, ...supplierUpdateBody]), update);

router.delete("/:id", validate(idParam), remove);

module.exports = router;
