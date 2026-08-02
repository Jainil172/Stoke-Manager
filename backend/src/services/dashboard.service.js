const DashboardModel = require("../models/dashboard.model");

async function getDashboardSummary() {
  const [totals, activities] = await Promise.all([
    DashboardModel.getTotals(),
    DashboardModel.getRecentActivities(7),
  ]);

  return {
    ...totals,
    recentActivities: activities.map((entry) => ({
      id: entry.id,
      productId: entry.product_id,
      productName: entry.product_name,
      type: entry.type,
      quantity: entry.quantity,
      party: entry.party,
      reference: entry.reference_number,
      notes: entry.notes,
      date: entry.created_at,
    })),
  };
}

async function getAnalytics() {
  const [monthly, categories, suppliers, valueTrend] = await Promise.all([
    DashboardModel.getMonthlyMovement(),
    DashboardModel.getCategoryDistribution(),
    DashboardModel.getSupplierDistribution(),
    DashboardModel.getInventoryValueTrend(),
  ]);

  return {
    monthly,
    categoryDistribution: categories,
    supplierDistribution: suppliers,
    inventoryValueTrend: valueTrend,
  };
}

module.exports = { getDashboardSummary, getAnalytics };
