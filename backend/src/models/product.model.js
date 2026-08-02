const { pool } = require("../config/db");

const PRODUCT_SELECT = `
  SELECT
    p.id, p.name, p.sku, p.category_id, p.supplier_id,
    p.purchase_price, p.selling_price, p.quantity, p.min_stock,
    p.description, p.status, p.image, p.created_at, p.updated_at,
    c.name AS category_name,
    s.company_name AS supplier_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN suppliers s ON s.id = p.supplier_id
`;

const PRODUCT_COLUMNS = "id, name, sku, category_id, supplier_id, quantity, min_stock, description, status";

async function findAll({ search, category, supplier, status, sort, order, limit, offset }) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(p.name LIKE ? OR p.sku LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    conditions.push("c.name = ?");
    params.push(category);
  }
  if (supplier) {
    conditions.push("s.company_name = ?");
    params.push(supplier);
  }
  if (status) {
    conditions.push("p.status = ?");
    params.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = `${sort} ${order}`;

  const [[countRows], [rows]] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN suppliers s ON s.id = p.supplier_id ${whereClause}`,
      params
    ),
    pool.query(
      `${PRODUCT_SELECT} ${whereClause} ORDER BY ${orderClause} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
  ]);

  return { items: rows, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query(`${PRODUCT_SELECT} WHERE p.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findBySku(sku, excludeId = null) {
  const [rows] = await pool.query(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE sku = ? AND (? IS NULL OR id != ?) LIMIT 1`,
    [sku, excludeId, excludeId]
  );
  return rows[0] || null;
}

async function create({
  name,
  sku,
  categoryId,
  supplierId,
  purchasePrice,
  sellingPrice,
  quantity,
  minStock,
  description,
  status,
  image,
}) {
  const [result] = await pool.query(
    `INSERT INTO products
      (name, sku, category_id, supplier_id, purchase_price, selling_price, quantity, min_stock, description, status, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      sku,
      categoryId,
      supplierId,
      purchasePrice,
      sellingPrice,
      quantity,
      minStock,
      description,
      status,
      image,
    ]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const allowed = {
    name: "name",
    sku: "sku",
    categoryId: "category_id",
    supplierId: "supplier_id",
    purchasePrice: "purchase_price",
    sellingPrice: "selling_price",
    quantity: "quantity",
    minStock: "min_stock",
    description: "description",
    status: "status",
    image: "image",
  };

  const entries = Object.entries(fields).filter(([key]) => allowed[key]);
  if (entries.length === 0) return findById(id);

  const assignments = entries.map(([key]) => `${allowed[key]} = ?`);
  const values = entries.map(([, value]) => value);

  await pool.query(`UPDATE products SET ${assignments.join(", ")} WHERE id = ?`, [
    ...values,
    id,
  ]);
  return findById(id);
}

async function updateQuantity(id, quantity, status) {
  const [result] = await pool.query(
    "UPDATE products SET quantity = ?, status = ? WHERE id = ?",
    [quantity, status, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findBySku, create, update, updateQuantity, remove };
