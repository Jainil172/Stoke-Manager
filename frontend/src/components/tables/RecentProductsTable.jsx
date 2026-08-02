import { Link } from "react-router-dom";
import { FiArrowRight, FiPackage } from "react-icons/fi";
import Card from "../common/Card.jsx";
import DataTable from "./DataTable.jsx";
import Badge from "../ui/Badge.jsx";
import { formatCurrency, getStatusBadge } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

export default function RecentProductsTable({ data = [], loading = false }) {
  const columns = [
    {
      key: "name",
      header: "Product",
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
      key: "category",
      header: "Category",
      hideOnMobile: true,
      render: (product) => <span className="text-muted">{product.category}</span>,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      render: (product) => <span className="font-medium text-white">{formatCurrency(product.price)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      render: (product) => <span className="text-muted">{product.stock}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (product) => {
        const status = getStatusBadge(product.status);
        return <Badge variant={status.variant} dot>{status.label}</Badge>;
      },
    },
  ];

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Recent Products</h3>
          <p className="mt-0.5 text-xs text-muted">Latest additions to your catalog</p>
        </div>
        <Link
          to="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-white"
        >
          View All
          <FiArrowRight size={14} />
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        showPagination={false}
        skeletonRows={5}
      />
    </Card>
  );
}
