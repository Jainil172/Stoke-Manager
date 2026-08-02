const { pool } = require("../config/db");

const LOG_SELECT = `
  SELECT
    l.id, l.product_id, l.type, l.quantity, l.party, l.reference_number, l.notes, l.created_at,
    p.name AS product_name, p.sku AS product_sku
  FROM inventory_logs l
  LEFT JOIN products p ON p.id = l.product_id
`;

async function findAll({ productId, type, limit, offset }) {
  const conditions = [];
  const params = [];

  if (productId) {
    conditions.push("l.product_id = ?");
    params.push(productId);
  }
  if (type) {
    conditions.push("l.type = ?");
    params.push(type);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [[countRows], [rows]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM inventory_logs l ${whereClause}`, params),
    pool.query(
      `${LOG_SELECT} ${whereClause} ORDER BY l.created_at DESC, l.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
  ]);

  return { items: rows, total: countRows[0].total };
}

async function create({ productId, type, quantity, party, referenceNumber, notes }) {
  const [result] = await pool.query(
    `INSERT INTO inventory_logs (product_id, type, quantity, party, reference_number, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [productId, type, quantity, party || null, referenceNumber, notes]
  );
  const [rows] = await pool.query(`${LOG_SELECT} WHERE l.id = ? LIMIT 1`, [result.insertId]);
  return rows[0] || null;
}

module.exports = { findAll, create };
