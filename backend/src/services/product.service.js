const ProductModel = require("../models/product.model");
const CategoryModel = require("../models/category.model");
const SupplierModel = require("../models/supplier.model");
const ApiError = require("../utils/ApiError");
const { deriveStatus } = require("../utils/stockStatus");
const { parsePage, parseLimit, resolveSort } = require("../utils/query");

const SORT_COLUMNS = {
  name: "p.name",
  price: "p.selling_price",
  quantity: "p.quantity",
  newest: "p.created_at",
  oldest: "p.created_at",
};

const DEFAULT_ORDERS = {
  name: "ASC",
  price: "ASC",
  quantity: "ASC",
  newest: "DESC",
  oldest: "ASC",
};

const VALID_STATUSES = ["in-stock", "low-stock", "out-of-stock"];

async function assertCategoryExists(categoryId) {
  const category = await CategoryModel.findById(categoryId);
  if (!category) throw new ApiError(400, "The selected category does not exist.");
  return category;
}

async function assertSupplierExists(supplierId) {
  const supplier = await SupplierModel.findById(supplierId);
  if (!supplier) throw new ApiError(400, "The selected supplier does not exist.");
  return supplier;
}

async function listProducts(query) {
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);
  const { column, order } = resolveSort(query.sort, query.order, SORT_COLUMNS, DEFAULT_ORDERS);

  const { items, total } = await ProductModel.findAll({
    search: query.search?.trim(),
    category: query.category,
    supplier: query.supplier,
    status: VALID_STATUSES.includes(query.status) ? query.status : undefined,
    sort: column,
    order,
    limit,
    offset: (page - 1) * limit,
  });

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getProduct(id) {
  const product = await ProductModel.findById(id);
  if (!product) throw new ApiError(404, "Product not found.");
  return product;
}

async function createProduct(payload) {
  const sku = payload.sku.trim().toUpperCase();

  const existingSku = await ProductModel.findBySku(sku);
  if (existingSku) throw new ApiError(409, "A product with this SKU already exists.");

  await assertCategoryExists(payload.categoryId);
  await assertSupplierExists(payload.supplierId);

  const quantity = Number(payload.quantity);
  const minStock = Number(payload.minStock ?? 10);

  return ProductModel.create({
    name: payload.name.trim(),
    sku,
    categoryId: payload.categoryId,
    supplierId: payload.supplierId,
    purchasePrice: Number(payload.purchasePrice ?? 0),
    sellingPrice: Number(payload.sellingPrice),
    quantity,
    minStock,
    description: payload.description?.trim() || null,
    status: deriveStatus(quantity, minStock),
    image: payload.image || null,
  });
}

async function updateProduct(id, payload) {
  const product = await ProductModel.findById(id);
  if (!product) throw new ApiError(404, "Product not found.");

  const fields = {};

  if (payload.name !== undefined) fields.name = payload.name.trim();
  if (payload.sku !== undefined) {
    const sku = payload.sku.trim().toUpperCase();
    const existingSku = await ProductModel.findBySku(sku, id);
    if (existingSku) throw new ApiError(409, "A product with this SKU already exists.");
    fields.sku = sku;
  }
  if (payload.categoryId !== undefined) {
    await assertCategoryExists(payload.categoryId);
    fields.categoryId = payload.categoryId;
  }
  if (payload.supplierId !== undefined) {
    await assertSupplierExists(payload.supplierId);
    fields.supplierId = payload.supplierId;
  }
  if (payload.purchasePrice !== undefined) fields.purchasePrice = Number(payload.purchasePrice);
  if (payload.sellingPrice !== undefined) fields.sellingPrice = Number(payload.sellingPrice);
  if (payload.description !== undefined) fields.description = payload.description?.trim() || null;
  if (payload.image !== undefined) fields.image = payload.image || null;

  const quantity =
    payload.quantity !== undefined ? Number(payload.quantity) : Number(product.quantity);
  const minStock =
    payload.minStock !== undefined ? Number(payload.minStock) : Number(product.min_stock);
  fields.quantity = quantity;
  fields.minStock = minStock;
  fields.status = deriveStatus(quantity, minStock);

  return ProductModel.update(id, fields);
}

async function deleteProduct(id) {
  const product = await ProductModel.findById(id);
  if (!product) throw new ApiError(404, "Product not found.");
  await ProductModel.remove(id);
  return true;
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
