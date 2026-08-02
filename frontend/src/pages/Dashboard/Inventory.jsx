import { useMemo, useState } from "react";
import { FiAlertTriangle, FiPackage, FiXCircle } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Dropdown from "../../components/ui/Dropdown.jsx";
import Badge from "../../components/ui/Badge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import LowStockChart from "../../components/charts/LowStockChart.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { formatCurrency, getStatusBadge } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const statusFilters = [
  { label: "All statuses", value: "all" },
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

function StockLevelBar({ stock, minStock }) {
  const status = getStatusBadge(stock === 0 ? "out-of-stock" : stock < minStock ? "low-stock" : "in-stock");
  const percentage = stock === 0 ? 0 : Math.min(100, Math.round((stock / (minStock * 2)) * 100));

  const barColor = {
    success: "bg-gradient-to-r from-success to-emerald-400",
    warning: "bg-gradient-to-r from-warning to-amber-400",
    danger: "bg-danger",
  };

  return (
    <div className="min-w-32">
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor[status.variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-white/40">
        {stock} / min {minStock}
      </p>
    </div>
  );
}

export default function Inventory() {
  const { products } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFilters[0]);
  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        !debouncedQuery.trim() ||
        product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesStatus =
        statusFilter.value === "all" || product.status === statusFilter.value;
      return matchesQuery && matchesStatus;
    });
  }, [products, debouncedQuery, statusFilter]);

  const totals = useMemo(() => {
    const stockValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
    const units = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = products.filter((product) => product.status === "low-stock").length;
    const outOfStock = products.filter((product) => product.status === "out-of-stock").length;
    return { stockValue, units, lowStock, outOfStock };
  }, [products]);

  const lowStockData = useMemo(
    () =>
      products
        .filter((product) => product.status === "low-stock" || product.status === "out-of-stock")
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8)
        .map((product) => ({
          name: product.name.length > 18 ? `${product.name.slice(0, 17)}…` : product.name,
          stock: product.stock,
        })),
    [products]
  );

  const columns = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white",
              product.color
            )}
          >
            <FiPackage size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{product.name}</p>
            <p className="text-xs text-muted">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock Level",
      sortable: true,
      sortValue: (product) => product.stock,
      render: (product) => <StockLevelBar stock={product.stock} minStock={product.minStock} />,
    },
    {
      key: "category",
      header: "Category",
      hideOnMobile: true,
      sortable: true,
      render: (product) => <span className="text-muted">{product.category}</span>,
    },
    {
      key: "value",
      header: "Stock Value",
      align: "right",
      sortable: true,
      sortValue: (product) => product.price * product.stock,
      render: (product) => (
        <span className="font-medium text-white">{formatCurrency(product.price * product.stock)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      sortable: true,
      sortValue: (product) => product.status,
      render: (product) => {
        const status = getStatusBadge(product.status);
        return <Badge variant={status.variant} dot>{status.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Live stock levels across all warehouses"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Units"
          value={totals.units}
          icon={FiPackage}
          color="from-blue-500 to-indigo-600"
          index={0}
        />
        <StatCard
          label="Stock Value"
          value={totals.stockValue}
          prefix="₹"
          icon={FiPackage}
          color="from-emerald-500 to-teal-600"
          index={1}
        />
        <StatCard
          label="Low Stock"
          value={totals.lowStock}
          icon={FiAlertTriangle}
          color="from-amber-500 to-orange-600"
          index={2}
        />
        <StatCard
          label="Out of Stock"
          value={totals.outOfStock}
          icon={FiXCircle}
          color="from-rose-500 to-pink-600"
          index={3}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <LowStockChart data={lowStockData} className="lg:col-span-1" />
        <Card className="lg:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search inventory..."
              className="w-full sm:max-w-xs"
            />
            <Dropdown
              width="w-44"
              trigger={
                <span className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white transition-colors hover:border-white/20">
                  {statusFilter.label}
                </span>
              }
              items={statusFilters.map((option) => ({
                key: `status-${option.value}`,
                label: option.label,
                onClick: () => setStatusFilter(option),
              }))}
            />
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            defaultSortKey="stock"
            emptyMessage="No inventory matches your filters."
            itemsPerPage={8}
          />
        </Card>
      </div>
    </div>
  );
}
