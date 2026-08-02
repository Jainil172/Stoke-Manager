const supplierService = require("../services/supplier.service");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const data = await supplierService.listSuppliers(req.query);
  res.json({ success: true, message: "Suppliers retrieved successfully", data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await supplierService.getSupplier(Number(req.params.id));
  res.json({ success: true, message: "Supplier retrieved successfully", data });
});

const create = asyncHandler(async (req, res) => {
  const data = await supplierService.createSupplier(req.body);
  res.status(201).json({ success: true, message: "Supplier created successfully", data });
});

const update = asyncHandler(async (req, res) => {
  const data = await supplierService.updateSupplier(Number(req.params.id), req.body);
  res.json({ success: true, message: "Supplier updated successfully", data });
});

const remove = asyncHandler(async (req, res) => {
  await supplierService.deleteSupplier(Number(req.params.id));
  res.json({ success: true, message: "Supplier deleted successfully", data: null });
});

module.exports = { list, getById, create, update, remove };
