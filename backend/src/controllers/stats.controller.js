const DashboardModel = require("../models/dashboard.model");
const { pool } = require("../config/db");

async function getPublicStats(_req, res, next) {
  try {
    const [totals, monthly, [recentRows]] = await Promise.all([
      DashboardModel.getTotals(),
      DashboardModel.getMonthlyMovement(),
      pool.query(
        `SELECT id, name, selling_price, status, quantity
         FROM products
         ORDER BY updated_at DESC
         LIMIT 5`
      ),
    ]);

    const recentProducts = recentRows.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.selling_price),
      status: product.status,
      quantity: Number(product.quantity),
    }));

    return res.json({ success: true, data: { totals, monthly, recentProducts } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getPublicStats };
