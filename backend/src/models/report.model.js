const { pool } = require("../config/db");

async function getInventorySnapshot() {
  const [rows] = await pool.query(
    `SELECT
       p.id, p.name, p.sku, p.quantity, p.min_stock, p.status,
       p.purchase_price, p.selling_price, p.updated_at,
       c.name AS category,
       s.company_name AS supplier
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     ORDER BY c.name ASC, p.name ASC`
  );

  return rows.map((row) => ({
    ...row,
    purchase_price: Number(row.purchase_price),
    selling_price: Number(row.selling_price),
  }));
}

async function getSummary() {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'low-stock' THEN 1 ELSE 0 END) AS low,
       SUM(CASE WHEN status = 'out-of-stock' THEN 1 ELSE 0 END) AS out_of_stock,
       SUM(quantity * selling_price) AS value,
       SUM(quantity) AS units
     FROM products`
  );
  return rows[0];
}

async function getStockMovements(type) {
  const [rows] = await pool.query(
    `SELECT
       l.id, l.type, l.quantity, l.party, l.reference_number, l.notes, l.created_at,
       p.name AS product_name, p.sku
     FROM inventory_logs l
     JOIN products p ON p.id = l.product_id
     WHERE l.type = ?
     ORDER BY l.created_at DESC
     LIMIT 1000`,
    [type]
  );
  return rows;
}

module.exports = { getInventorySnapshot, getSummary, getStockMovements };
