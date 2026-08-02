const reportService = require("../services/report.service");
const asyncHandler = require("../utils/asyncHandler");

const scopeSuffix = (scope) => (scope === "catalog" ? "" : `-${scope}`);

const pdf = asyncHandler(async (req, res) => {
  const scope = req.query.scope || "catalog";
  const buffer = await reportService.generatePdf(scope);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="stockflow${scopeSuffix(scope)}-report-${new Date().toISOString().slice(0, 10)}.pdf"`
  );
  res.send(buffer);
});

const csv = asyncHandler(async (req, res) => {
  const scope = req.query.scope || "catalog";
  const content = await reportService.generateCsv(scope);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="stockflow${scopeSuffix(scope)}-report-${new Date().toISOString().slice(0, 10)}.csv"`
  );
  res.send(content);
});

module.exports = { pdf, csv };
