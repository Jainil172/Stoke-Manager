function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseLimit(value, max = 100) {
  const limit = Number.parseInt(value, 10);
  return Number.isInteger(limit) && limit > 0 ? Math.min(limit, max) : 10;
}

function resolveSort(sortValue, orderValue, columns, defaultOrders) {
  const key = Object.prototype.hasOwnProperty.call(columns, sortValue)
    ? sortValue
    : Object.keys(columns)[0];
  const explicitOrder = String(orderValue).toLowerCase();
  const order =
    explicitOrder === "asc" || explicitOrder === "desc"
      ? explicitOrder.toUpperCase()
      : (defaultOrders[key] ?? "ASC");
  return { column: columns[key], order };
}

module.exports = { parsePage, parseLimit, resolveSort };
