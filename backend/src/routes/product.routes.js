const { Router } = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../utils/validate");
const {
  list,
  getById,
  create,
  update,
  remove,
  uploadImage,
} = require("../controllers/product.controller");
const { upload } = require("../middleware/upload.middleware");

const router = Router();

const idParam = [param("id").isInt({ min: 1 }).withMessage("Product id must be a positive integer.")];

const positiveDecimal = (field) =>
  body(field)
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number.");

const createBody = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required.")
    .isLength({ min: 2, max: 150 })
    .withMessage("Product name must be between 2 and 150 characters."),
  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("SKU must be between 2 and 50 characters."),
  body("categoryId")
    .notEmpty()
    .withMessage("Category is required.")
    .isInt({ min: 1 })
    .withMessage("Category id must be a positive integer."),
  body("supplierId")
    .notEmpty()
    .withMessage("Supplier is required.")
    .isInt({ min: 1 })
    .withMessage("Supplier id must be a positive integer."),
  body("purchasePrice")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a non-negative number."),
  positiveDecimal("sellingPrice"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer."),
  body("minStock")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Reorder point must be a non-negative integer."),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters."),
  body("image")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Image must be at most 500 characters."),
];

const updateBody = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty.")
    .isLength({ min: 2, max: 150 })
    .withMessage("Product name must be between 2 and 150 characters."),
  body("sku")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("SKU cannot be empty.")
    .isLength({ min: 2, max: 50 })
    .withMessage("SKU must be between 2 and 50 characters."),
  body("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category id must be a positive integer."),
  body("supplierId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Supplier id must be a positive integer."),
  body("purchasePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a non-negative number."),
  body("sellingPrice")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Selling price must be a positive number."),
  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer."),
  body("minStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reorder point must be a non-negative integer."),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters."),
  body("image")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Image must be at most 500 characters."),
];

router.get("/", list);

router.get("/:id", validate(idParam), getById);

router.post("/", validate(createBody), create);

router.put("/:id", validate([...idParam, ...updateBody]), update);

router.delete("/:id", validate(idParam), remove);

router.post("/:id/image", validate(idParam), upload.single("image"), uploadImage);

module.exports = router;
