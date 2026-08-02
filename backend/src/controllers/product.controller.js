const productService = require("../services/product.service");
const asyncHandler = require("../utils/asyncHandler");
const { UPLOADS_DIR } = require("../middleware/upload.middleware");

const list = asyncHandler(async (req, res) => {
  const data = await productService.listProducts(req.query);
  res.json({ success: true, message: "Products retrieved successfully", data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await productService.getProduct(Number(req.params.id));
  res.json({ success: true, message: "Product retrieved successfully", data });
});

const create = asyncHandler(async (req, res) => {
  const data = await productService.createProduct(req.body);
  res.status(201).json({ success: true, message: "Product created successfully", data });
});

const update = asyncHandler(async (req, res) => {
  const data = await productService.updateProduct(Number(req.params.id), req.body);
  res.json({ success: true, message: "Product updated successfully", data });
});

const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(Number(req.params.id));
  res.json({ success: true, message: "Product deleted successfully", data: null });
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided." });
  }

  const product = await productService.getProduct(Number(req.params.id));
  const data = await productService.updateProduct(Number(req.params.id), {
    image: `/uploads/${req.file.filename}`,
  });

  if (product?.image && product.image.startsWith("/uploads/")) {
    const { path } = require("path");
    const fs = require("fs");
    const previous = path.join(UPLOADS_DIR, path.basename(product.image));
    fs.promises.unlink(previous).catch(() => {});
  }

  res.json({ success: true, message: "Product image uploaded successfully", data });
});

module.exports = { list, getById, create, update, remove, uploadImage };
