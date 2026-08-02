const { Router } = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../utils/validate");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/category.controller");

const router = Router();

const idParam = [param("id").isInt({ min: 1 }).withMessage("Category id must be a positive integer.")];

router.get("/", list);

router.get("/:id", validate(idParam), getById);

router.post(
  "/",
  validate([
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Category name is required.")
      .isLength({ min: 2, max: 100 })
      .withMessage("Category name must be between 2 and 100 characters."),
    body("description")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be at most 500 characters."),
  ]),
  create
);

router.put(
  "/:id",
  validate([
    ...idParam,
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Category name is required.")
      .isLength({ min: 2, max: 100 })
      .withMessage("Category name must be between 2 and 100 characters."),
    body("description")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be at most 500 characters."),
  ]),
  update
);

router.delete("/:id", validate(idParam), remove);

module.exports = router;
