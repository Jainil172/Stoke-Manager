const { pool } = require("../config/db");

async function createMessage({ name, email, message }) {
  const [result] = await pool.query(
    "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
    [name, email, message]
  );
  return result.insertId;
}

module.exports = { createMessage };
