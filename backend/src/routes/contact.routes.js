const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../utils/validate");
const { contact } = require("../controllers/contact.controller");

const router = Router();

router.post(
  "/",
  validate([
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters."),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required.")
      .isLength({ min: 10, max: 2000 })
      .withMessage("Message must be between 10 and 2000 characters."),
  ]),
  contact
);

module.exports = router;
