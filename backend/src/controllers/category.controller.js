const categoryService = require("../services/category.service");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const data = await categoryService.listCategories(req.query);
  res.json({ success: true, message: "Categories retrieved successfully", data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategory(Number(req.params.id));
  res.json({ success: true, message: "Category retrieved successfully", data });
});

const create = asyncHandler(async (req, res) => {
  const data = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, message: "Category created successfully", data });
});

const update = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategory(Number(req.params.id), req.body);
  res.json({ success: true, message: "Category updated successfully", data });
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(Number(req.params.id));
  res.json({ success: true, message: "Category deleted successfully", data: null });
});

module.exports = { list, getById, create, update, remove };
