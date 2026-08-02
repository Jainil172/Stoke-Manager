const CategoryModel = require("../models/category.model");
const ApiError = require("../utils/ApiError");
const { parsePage, parseLimit, resolveSort } = require("../utils/query");

const SORT_COLUMNS = {
  name: "name",
  newest: "created_at",
  oldest: "created_at",
};

const DEFAULT_ORDERS = {
  name: "ASC",
  newest: "DESC",
  oldest: "ASC",
};

async function listCategories(query) {
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);
  const { column, order } = resolveSort(query.sort, query.order, SORT_COLUMNS, DEFAULT_ORDERS);

  const { items, total } = await CategoryModel.findAll({
    search: query.search?.trim(),
    sort: column,
    order,
    limit,
    offset: (page - 1) * limit,
  });

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getCategory(id) {
  const category = await CategoryModel.findById(id);
  if (!category) throw new ApiError(404, "Category not found.");
  return category;
}

async function createCategory({ name, description }) {
  const trimmedName = name.trim();

  const existing = await CategoryModel.findByName(trimmedName);
  if (existing) throw new ApiError(409, "A category with this name already exists.");

  return CategoryModel.create({
    name: trimmedName,
    description: description?.trim() || null,
  });
}

async function updateCategory(id, { name, description }) {
  const category = await CategoryModel.findById(id);
  if (!category) throw new ApiError(404, "Category not found.");

  const trimmedName = name.trim();
  const existing = await CategoryModel.findByName(trimmedName);
  if (existing && existing.id !== id) {
    throw new ApiError(409, "A category with this name already exists.");
  }

  return CategoryModel.update(id, {
    name: trimmedName,
    description: description?.trim() || null,
  });
}

async function deleteCategory(id) {
  const removed = await CategoryModel.remove(id);
  if (!removed) throw new ApiError(404, "Category not found.");
  return removed;
}

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
