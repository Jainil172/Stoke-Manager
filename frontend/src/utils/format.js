const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export function formatCompact(value) {
  return compactFormatter.format(value);
}

export function formatNumber(value) {
  return numberFormatter.format(value);
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const gradientPalette = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-purple-600",
  "from-green-500 to-emerald-600",
];

export function getGradient(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return gradientPalette[hash % gradientPalette.length];
}

export const statusMeta = {
  "in-stock": { label: "In Stock", variant: "success" },
  "low-stock": { label: "Low Stock", variant: "warning" },
  "out-of-stock": { label: "Out of Stock", variant: "danger" },
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "neutral" },
};

export function getStatusBadge(status) {
  return statusMeta[status] ?? { label: status, variant: "neutral" };
}

export const activityMeta = {
  "stock-in": { label: "Stock In", variant: "success" },
  "stock-out": { label: "Stock Out", variant: "danger" },
  adjustment: { label: "Adjustment", variant: "warning" },
  return: { label: "Return", variant: "primary" },
};

export function getActivityBadge(type) {
  return activityMeta[type] ?? { label: type, variant: "neutral" };
}

export function getStockStatus(stock = 0, minStock = 0) {
  if (stock <= 0) return "out-of-stock";
  if (stock < minStock) return "low-stock";
  return "in-stock";
}

export function generateId() {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nextId(items = []) {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}
