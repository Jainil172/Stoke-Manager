const dashboardService = require("../services/dashboard.service");
const asyncHandler = require("../utils/asyncHandler");

const dashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary();
  res.json({ success: true, message: "Dashboard summary retrieved successfully", data });
});

const analytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAnalytics();
  res.json({ success: true, message: "Analytics retrieved successfully", data });
});

module.exports = { dashboard, analytics };
