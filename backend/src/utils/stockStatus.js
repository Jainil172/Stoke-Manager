function deriveStatus(quantity = 0, minStock = 0) {
  if (quantity <= 0) return "out-of-stock";
  if (quantity < minStock) return "low-stock";
  return "in-stock";
}

module.exports = { deriveStatus };
