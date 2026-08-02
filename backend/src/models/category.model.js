const { pool } = require("../config/db");

const CATEGORY_COLUMNS = "id, name, description, created_at, updated_at";

async function findAll({ search, sort, order, limit, offset }) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = `${sort} ${order}`;

  const [[countRows], [rows]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM categories ${whereClause}`, params),
    pool.query(
      `SELECT ${CATEGORY_COLUMNS} FROM categories ${whereClause} ORDER BY ${orderClause} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
  ]);

  return { items: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${CATEGORY_COLUMNS} FROM categories WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByName(name) {
  const [rows] = await pool.query(
    `SELECT ${CATEGORY_COLUMNS} FROM categories WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows[0] || null;
}

async function create({ name, description }) {
  const [result] = await pool.query(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description]
  );
  return findById(result.insertId);
}

async function update(id, { name, description }) {
  await pool.query("UPDATE categories SET name = ?, description = ? WHERE id = ?", [
    name,
    description,
    id,
  ]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByName, create, update, remove };
