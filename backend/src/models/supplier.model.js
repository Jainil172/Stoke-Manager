const { pool } = require("../config/db");

const SUPPLIER_COLUMNS =
  "id, company_name, contact_person, email, phone, address, status, created_at, updated_at";

async function findAll({ search, sort, order, limit, offset }) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(
      "(company_name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR address LIKE ?)"
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = `${sort} ${order}`;

  const [[countRows], [rows]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM suppliers ${whereClause}`, params),
    pool.query(
      `SELECT ${SUPPLIER_COLUMNS} FROM suppliers ${whereClause} ORDER BY ${orderClause} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
  ]);

  return { items: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SUPPLIER_COLUMNS} FROM suppliers WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email, excludeId = null) {
  const [rows] = await pool.query(
    `SELECT ${SUPPLIER_COLUMNS} FROM suppliers WHERE email = ? AND (? IS NULL OR id != ?) LIMIT 1`,
    [email, excludeId, excludeId]
  );
  return rows[0] || null;
}

async function create({ companyName, contactPerson, email, phone, address, status }) {
  const [result] = await pool.query(
    `INSERT INTO suppliers (company_name, contact_person, email, phone, address, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [companyName, contactPerson, email, phone, address, status]
  );
  return findById(result.insertId);
}

async function update(id, { companyName, contactPerson, email, phone, address, status }) {
  await pool.query(
    `UPDATE suppliers
     SET company_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, status = ?
     WHERE id = ?`,
    [companyName, contactPerson, email, phone, address, status, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM suppliers WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmail, create, update, remove };
