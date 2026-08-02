const { validationResult } = require("express-validator");

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

module.exports = { validate };
