const ContactModel = require("../models/contact.model");

async function submitMessage({ name, email, message }) {
  return ContactModel.createMessage({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });
}

module.exports = { submitMessage };
