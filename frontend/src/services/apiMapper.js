const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-sky-600",
  "from-amber-500 to-orange-600",
  "from-fuchsia-500 to-pink-600",
  "from-yellow-500 to-amber-600",
  "from-stone-500 to-neutral-600",
  "from-teal-500 to-emerald-600",
  "from-blue-400 to-indigo-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-600",
  "from-purple-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-sky-500 to-cyan-600",
  "from-slate-500 to-zinc-600",
];

const CATEGORY_STYLES = {
  Electronics: { icon: "cpu", color: "from-blue-500 to-indigo-600", hex: "#2563EB" },
  Accessories: { icon: "bag", color: "from-violet-500 to-purple-600", hex: "#8B5CF6" },
  Audio: { icon: "headphones", color: "from-emerald-500 to-teal-600", hex: "#10B981" },
  Storage: { icon: "database", color: "from-amber-500 to-orange-600", hex: "#F59E0B" },
  Peripherals: { icon: "mouse", color: "from-rose-500 to-pink-600", hex: "#F43F5E" },
  Displays: { icon: "monitor", color: "from-cyan-500 to-sky-600", hex: "#06B6D4" },
  Networking: { icon: "wifi", color: "from-fuchsia-500 to-purple-600", hex: "#D946EF" },
  Power: { icon: "zap", color: "from-orange-400 to-red-500", hex: "#F97316" },
};

export const gradientFor = (id) => {
  const index = (Number(id) - 1) % GRADIENTS.length;
  return GRADIENTS[index < 0 ? index + GRADIENTS.length : index];
};

const categoryStyleFor = (name, id) =>
  CATEGORY_STYLES[name] ?? { icon: "cpu", color: gradientFor(id), hex: "#64748B" };

const toDateString = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

export function mapProduct(row) {
  return {
    id: Number(row.id),
    name: row.name,
    sku: row.sku,
    category: row.category_name ?? "",
    supplier: row.supplier_name ?? "",
    categoryId: row.category_id !== null && row.category_id !== undefined ? Number(row.category_id) : null,
    supplierId: row.supplier_id !== null && row.supplier_id !== undefined ? Number(row.supplier_id) : null,
    purchasePrice: Number(row.purchase_price) || 0,
    price: Number(row.selling_price) || 0,
    stock: Number(row.quantity) || 0,
    minStock: Number(row.min_stock) || 0,
    status: row.status,
    description: row.description ?? "",
    image: row.image ?? null,
    updatedAt: toDateString(row.updated_at),
    color: gradientFor(row.id),
  };
}

export function mapCategory(row) {
  const style = categoryStyleFor(row.name, row.id);
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description ?? "",
    icon: style.icon,
    color: style.color,
    hex: style.hex,
  };
}

export function mapSupplier(row) {
  return {
    id: Number(row.id),
    company: row.company_name,
    contact: row.contact_person ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    location: row.address ?? "",
    status: row.status,
    rating: Number((3.8 + (Number(row.id) % 11) * 0.1).toFixed(1)),
    color: gradientFor(row.id),
  };
}

export function mapLog(row, products) {
  const product = products.find((item) => item.id === Number(row.product_id));
  const base = {
    id: Number(row.id),
    productId: Number(row.product_id),
    quantity: Number(row.quantity),
    date: new Date(row.created_at).getTime(),
    user: "You",
    notes: row.notes ?? "",
  };
  if (row.type === "stock-in") {
    return {
      ...base,
      supplier: row.party || product?.supplier || "Unknown supplier",
      reference: row.reference_number ?? "",
    };
  }
  return {
    ...base,
    customer: row.party || "Unknown",
    invoice: row.reference_number ?? "",
  };
}

export function toProductPayload(product, { categories, suppliers }) {
  const categoryId = categories.find((item) => item.name === product.category)?.id;
  const supplierId = suppliers.find((item) => item.company === product.supplier)?.id;
  return {
    name: product.name,
    sku: product.sku,
    ...(categoryId !== undefined ? { categoryId } : {}),
    ...(supplierId !== undefined ? { supplierId } : {}),
    purchasePrice: Number(product.purchasePrice) || 0,
    sellingPrice: Number(product.price) || 0,
    quantity: Number(product.stock) || 0,
    minStock: Number(product.minStock) || 0,
    description: product.description ?? "",
    image: product.image ?? null,
  };
}

export function toCategoryPayload(category) {
  return {
    name: category.name,
    description: category.description ?? "",
  };
}

export function toSupplierPayload(supplier) {
  return {
    companyName: supplier.company,
    contactPerson: supplier.contact,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address || supplier.location,
    status: supplier.status,
  };
}

export function extractApiError(error, fallback) {
  const response = error?.response?.data;
  if (response?.message && typeof response.message === "string") {
    return response.message;
  }
  if (Array.isArray(response?.errors) && response.errors.length > 0) {
    return response.errors.map((entry) => entry.message).join(" · ");
  }
  return fallback;
}

const PIE_COLORS = ["#2563EB", "#60A5FA", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316"];

export const withPieColors = (entries) =>
  entries.map((entry, index) => ({
    ...entry,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

export function mapDashboard(row) {
  return {
    totalProducts: Number(row.totalProducts) || 0,
    categories: Number(row.categories) || 0,
    suppliers: Number(row.suppliers) || 0,
    lowStock: Number(row.lowStock) || 0,
    outOfStock: Number(row.outOfStock) || 0,
    inventoryValue: Number(row.inventoryValue) || 0,
    recentActivities: Array.isArray(row.recentActivities)
      ? row.recentActivities.map((entry) => ({
          id: Number(entry.id),
          product: entry.productName ?? "Unknown product",
          productId: Number(entry.productId),
          type: entry.type,
          quantity: Number(entry.quantity) || 0,
          party: entry.party ?? "",
          note: [entry.reference, entry.notes].filter(Boolean).join(" · "),
          user: entry.party || "System",
          time: new Date(entry.date).getTime(),
        }))
      : [],
  };
}
