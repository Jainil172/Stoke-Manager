const { pool } = require("../config/db");
const InventoryModel = require("../models/inventory.model");
const ApiError = require("../utils/ApiError");
const { deriveStatus } = require("../utils/stockStatus");
const { parsePage, parseLimit } = require("../utils/query");

async function recordStockMovement({ productId, type, quantity, party, referenceNumber, notes }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [productRows] = await connection.query(
      "SELECT id, name, quantity, min_stock, status FROM products WHERE id = ? FOR UPDATE",
      [productId]
    );
    if (productRows.length === 0) {
      throw new ApiError(404, "Product not found.");
    }

    const product = productRows[0];
    let newQuantity;

    if (type === "stock-in") {
      newQuantity = product.quantity + quantity;
    } else {
      if (product.quantity < quantity) {
        throw new ApiError(
          400,
          `Insufficient stock. Only ${product.quantity} unit(s) of "${product.name}" available.`
        );
      }
      newQuantity = product.quantity - quantity;
    }

    const status = deriveStatus(newQuantity, product.min_stock);

    await connection.query("UPDATE products SET quantity = ?, status = ? WHERE id = ?", [
      newQuantity,
      status,
      productId,
    ]);

    const [logResult] = await connection.query(
      `INSERT INTO inventory_logs (product_id, type, quantity, party, reference_number, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, type, quantity, party || null, referenceNumber || null, notes || null]
    );

    const [logRows] = await connection.query(
      `SELECT l.id, l.product_id, l.type, l.quantity, l.party, l.reference_number, l.notes, l.created_at,
              p.name AS product_name, p.sku AS product_sku
       FROM inventory_logs l
       LEFT JOIN products p ON p.id = l.product_id
       WHERE l.id = ? LIMIT 1`,
      [logResult.insertId]
    );

    await connection.commit();

    return {
      log: logRows[0],
      product: { ...product, quantity: newQuantity, status },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listHistory(query) {
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);

  const { items, total } = await InventoryModel.findAll({
    productId: query.productId ? Number(query.productId) : undefined,
    type: ["stock-in", "stock-out"].includes(query.type) ? query.type : undefined,
    limit,
    offset: (page - 1) * limit,
  });

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

module.exports = { recordStockMovement, listHistory };
