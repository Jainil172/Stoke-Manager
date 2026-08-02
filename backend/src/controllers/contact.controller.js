const contactService = require("../services/contact.service");
const asyncHandler = require("../utils/asyncHandler");

const contact = asyncHandler(async (req, res) => {
  await contactService.submitMessage(req.body);
  res.status(201).json({
    success: true,
    message: "Message sent — we'll reply within one business day.",
  });
});

module.exports = { contact };
