const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const {
  register,
  login,
  profile,
  updateProfile,
  changePassword,
  deleteAccount,
  getSettings,
  updateSettings,
  forgotPassword,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = Router();

function validate(validations) {
  return [
    ...validations,
    (req, res, next) => {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        const errors = result.array().map(({ path, msg }) => ({
          field: path,
          message: msg,
        }));
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }
      return next();
    },
  ];
}

router.post(
  "/register",
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
    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
  ]),
  register
);

router.post(
  "/login",
  validate([
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("password").notEmpty().withMessage("Password is required."),
  ]),
  login
);

router.post(
  "/forgot-password",
  validate([
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
  ]),
  forgotPassword
);

router.get("/profile", authMiddleware, profile);

router.put(
  "/profile",
  authMiddleware,
  validate([
    body("name").optional({ values: "falsy" }).trim().notEmpty().withMessage("Name is required."),
    body("email")
      .optional({ values: "falsy" })
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("phone").optional({ values: "falsy" }).trim().isLength({ max: 50 }).withMessage("Phone is too long."),
    body("location").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("Location is too long."),
    body("bio").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("Bio is too long."),
  ]),
  updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  validate([
    body("currentPassword").notEmpty().withMessage("Current password is required."),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required.")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters."),
  ]),
  changePassword
);

router.delete("/account", authMiddleware, deleteAccount);

router.get("/settings", authMiddleware, getSettings);

router.put(
  "/settings",
  authMiddleware,
  validate([
    body("lowStockAlerts").optional().isBoolean().withMessage("lowStockAlerts must be a boolean."),
    body("weeklyDigest").optional().isBoolean().withMessage("weeklyDigest must be a boolean."),
    body("orderUpdates").optional().isBoolean().withMessage("orderUpdates must be a boolean."),
    body("language").optional({ values: "falsy" }).trim().isLength({ min: 2, max: 20 }).withMessage("Language is invalid."),
    body("currency").optional({ values: "falsy" }).trim().isLength({ min: 3, max: 10 }).withMessage("Currency is invalid."),
  ]),
  updateSettings
);

module.exports = router;
