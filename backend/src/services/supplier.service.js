const SupplierModel = require("../models/supplier.model");
const ApiError = require("../utils/ApiError");
const { parsePage, parseLimit, resolveSort } = require("../utils/query");

const SORT_COLUMNS = {
  name: "company_name",
  newest: "created_at",
  oldest: "created_at",
};

const DEFAULT_ORDERS = {
  name: "ASC",
  newest: "DESC",
  oldest: "ASC",
};

async function listSuppliers(query) {
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);
  const { column, order } = resolveSort(query.sort, query.order, SORT_COLUMNS, DEFAULT_ORDERS);

  const { items, total } = await SupplierModel.findAll({
    search: query.search?.trim(),
    sort: column,
    order,
    limit,
    offset: (page - 1) * limit,
  });

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getSupplier(id) {
  const supplier = await SupplierModel.findById(id);
  if (!supplier) throw new ApiError(404, "Supplier not found.");
  return supplier;
}

async function createSupplier(payload) {
  const email = payload.email?.trim().toLowerCase() || null;
  const companyName = payload.companyName.trim();

  if (email) {
    const existing = await SupplierModel.findByEmail(email);
    if (existing) throw new ApiError(409, "A supplier with this email already exists.");
  }

  return SupplierModel.create({
    companyName,
    contactPerson: payload.contactPerson?.trim() || null,
    email,
    phone: payload.phone?.trim() || null,
    address: payload.address?.trim() || null,
    status: payload.status || "active",
  });
}

async function updateSupplier(id, payload) {
  const supplier = await SupplierModel.findById(id);
  if (!supplier) throw new ApiError(404, "Supplier not found.");

  const email = payload.email?.trim().toLowerCase() || null;
  if (email) {
    const existing = await SupplierModel.findByEmail(email, id);
    if (existing) throw new ApiError(409, "A supplier with this email already exists.");
  }

  return SupplierModel.update(id, {
    companyName: payload.companyName?.trim() ?? supplier.company_name,
    contactPerson: payload.contactPerson?.trim() ?? supplier.contact_person,
    email: email ?? supplier.email,
    phone: payload.phone?.trim() ?? supplier.phone,
    address: payload.address?.trim() ?? supplier.address,
    status: payload.status ?? supplier.status,
  });
}

async function deleteSupplier(id) {
  const removed = await SupplierModel.remove(id);
  if (!removed) throw new ApiError(404, "Supplier not found.");
  return removed;
}

module.exports = { listSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
