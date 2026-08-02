const inventoryService = require("../services/inventory.service");
const asyncHandler = require("../utils/asyncHandler");

const stockIn = asyncHandler(async (req, res) => {
  const data = await inventoryService.recordStockMovement({
    productId: req.body.productId,
    type: "stock-in",
    quantity: req.body.quantity,
    party: req.body.supplier || req.body.party,
    referenceNumber: req.body.referenceNumber,
    notes: req.body.notes,
  });
  res.status(201).json({ success: true, message: "Stock received successfully", data });
});

const stockOut = asyncHandler(async (req, res) => {
  const data = await inventoryService.recordStockMovement({
    productId: req.body.productId,
    type: "stock-out",
    quantity: req.body.quantity,
    party: req.body.customer || req.body.party,
    referenceNumber: req.body.referenceNumber,
    notes: req.body.notes,
  });
  res.status(201).json({ success: true, message: "Stock dispatched successfully", data });
});

const history = asyncHandler(async (req, res) => {
  const data = await inventoryService.listHistory(req.query);
  res.json({ success: true, message: "Inventory history retrieved successfully", data });
});

module.exports = { stockIn, stockOut, history };
