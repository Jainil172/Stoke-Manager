const { pool } = require("../config/db");

const USER_COLUMNS = "id, name, email, phone, location, bio, avatar, created_at";

const SETTINGS_COLUMNS =
  "low_stock_alerts, weekly_digest, order_updates, language, currency";

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT ${USER_COLUMNS}, password FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ name, email, password }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password]
  );
  return findById(result.insertId);
}

async function updateProfile(id, fields) {
  const allowed = {
    name: "name",
    email: "email",
    phone: "phone",
    location: "location",
    bio: "bio",
    avatar: "avatar",
  };

  const entries = Object.entries(fields)
    .filter(([key]) => allowed[key] && fields[key] !== undefined)
    .map(([key, value]) => [allowed[key], value]);
  if (entries.length === 0) return findById(id);

  const assignments = entries.map(([key]) => `${key} = ?`);
  const values = entries.map(([, value]) => value);

  await pool.query(`UPDATE users SET ${assignments.join(", ")} WHERE id = ?`, [
    ...values,
    id,
  ]);
  return findById(id);
}

async function updatePassword(id, hashedPassword) {
  const [result] = await pool.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedPassword, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function getSettings(userId) {
  const [rows] = await pool.query(
    `SELECT ${SETTINGS_COLUMNS} FROM user_settings WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (rows[0]) return rows[0];

  await pool.query(
    "INSERT INTO user_settings (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = user_id",
    [userId]
  );
  const [fresh] = await pool.query(
    `SELECT ${SETTINGS_COLUMNS} FROM user_settings WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return fresh[0];
}

async function updateSettings(userId, fields) {
  const allowed = {
    lowStockAlerts: "low_stock_alerts",
    weeklyDigest: "weekly_digest",
    orderUpdates: "order_updates",
    language: "language",
    currency: "currency",
  };

  const entries = Object.entries(fields).filter(([key]) => allowed[key]);
  if (entries.length === 0) return getSettings(userId);

  const assignments = entries.map(([key]) => `${allowed[key]} = ?`);
  const values = entries.map(([, value]) => value);

  await pool.query(
    `INSERT INTO user_settings (user_id, ${allowed[entries[0][0]]})
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE ${assignments.join(", ")}`,
    [userId, values[0], ...values, userId]
  );
  return getSettings(userId);
}

module.exports = {
  findByEmail,
  findById,
  create,
  updateProfile,
  updatePassword,
  remove,
  getSettings,
  updateSettings,
};
