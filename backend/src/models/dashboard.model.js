const { pool } = require("../config/db");

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

async function getTotals() {
  const [[productsRow], [categoriesRow], [suppliersRow], [lowRow], [outRow], [valueRow]] =
    await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM products"),
      pool.query("SELECT COUNT(*) AS total FROM categories"),
      pool.query("SELECT COUNT(*) AS total FROM suppliers"),
      pool.query("SELECT COUNT(*) AS total FROM products WHERE status = 'low-stock'"),
      pool.query("SELECT COUNT(*) AS total FROM products WHERE status = 'out-of-stock'"),
      pool.query(
        "SELECT COALESCE(SUM(quantity * selling_price), 0) AS value FROM products"
      ),
    ]);

  return {
    totalProducts: productsRow[0].total,
    categories: categoriesRow[0].total,
    suppliers: suppliersRow[0].total,
    lowStock: lowRow[0].total,
    outOfStock: outRow[0].total,
    inventoryValue: Number(valueRow[0].value),
  };
}

async function getRecentActivities(limit = 7) {
  const [rows] = await pool.query(
    `SELECT
       l.id, l.type, l.quantity, l.party, l.reference_number, l.notes, l.created_at,
       p.id AS product_id, p.name AS product_name
     FROM inventory_logs l
     JOIN products p ON p.id = l.product_id
     ORDER BY l.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

async function getMonthlyMovement() {
  const [rows] = await pool.query(
    `SELECT
       DATE_FORMAT(l.created_at, '%Y-%m') AS month,
       SUM(CASE WHEN l.type = 'stock-in' THEN l.quantity ELSE 0 END) AS stockIn,
       SUM(CASE WHEN l.type = 'stock-out' THEN l.quantity ELSE 0 END) AS stockOut,
       SUM(CASE WHEN l.type = 'stock-out' THEN l.quantity * p.selling_price ELSE 0 END) AS revenue,
       SUM(CASE WHEN l.type = 'stock-in' THEN l.quantity * p.purchase_price ELSE 0 END) AS cost
     FROM inventory_logs l
     JOIN products p ON p.id = l.product_id
     WHERE l.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(l.created_at, '%Y-%m')
     ORDER BY month ASC`
  );

  const byMonth = Object.fromEntries(rows.map((row) => [row.month, row]));

  const result = [];
  const now = new Date();
  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const row = byMonth[key];
    result.push({
      month: MONTH_NAMES[date.getMonth()],
      stockIn: row ? Number(row.stockIn) : 0,
      stockOut: row ? Number(row.stockOut) : 0,
      revenue: row ? Number(row.revenue) : 0,
      cost: row ? Number(row.cost) : 0,
    });
  }
  return result;
}

async function getCategoryDistribution() {
  const [rows] = await pool.query(
    `SELECT c.name, COUNT(p.id) AS value
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id, c.name
     ORDER BY value DESC, c.name ASC
     LIMIT 5`
  );
  return rows.map((row) => ({ name: row.name, value: row.value }));
}

async function getSupplierDistribution() {
  const [rows] = await pool.query(
    `SELECT s.company_name AS name, COUNT(p.id) AS value
     FROM suppliers s
     LEFT JOIN products p ON p.supplier_id = s.id
     GROUP BY s.id, s.company_name
     ORDER BY value DESC, s.company_name ASC
     LIMIT 5`
  );
  return rows.map((row) => ({ name: row.name, value: row.value }));
}

async function getInventoryValueTrend() {
  const [rows] = await pool.query(
    `SELECT
       DATE_FORMAT(l.created_at, '%Y-%m') AS month,
       SUM(CASE WHEN l.type = 'stock-in' THEN l.quantity * p.purchase_price ELSE 0 END) AS costIn,
       SUM(CASE WHEN l.type = 'stock-out' THEN l.quantity * p.purchase_price ELSE 0 END) AS costOut
     FROM inventory_logs l
     JOIN products p ON p.id = l.product_id
     WHERE l.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(l.created_at, '%Y-%m')
     ORDER BY month ASC`
  );

  const byMonth = Object.fromEntries(rows.map((row) => [row.month, row]));

  const result = [];
  const now = new Date();
  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const row = byMonth[key];
    result.push({
      month: MONTH_NAMES[date.getMonth()],
      value: row ? Number(row.costIn) - Number(row.costOut) : 0,
    });
  }
  return result;
}

module.exports = {
  getTotals,
  getRecentActivities,
  getMonthlyMovement,
  getCategoryDistribution,
  getSupplierDistribution,
  getInventoryValueTrend,
};
