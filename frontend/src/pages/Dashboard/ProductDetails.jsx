import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowDownCircle,
  FiArrowLeft,
  FiArrowUpCircle,
  FiDollarSign,
  FiEdit2,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiTrash2,
  FiTruck,
} from "react-icons/fi";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Timeline from "../../components/ui/Timeline.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import ProductFormModal from "../../components/modals/ProductFormModal.jsx";
import ConfirmationDialog from "../../components/common/ConfirmationDialog.jsx";
import { useData } from "../../context/DataContext.jsx";
import { showToast } from "../../components/common/Toast.jsx";
import {
  formatCurrency,
  formatDate,
  getActivityBadge,
  getStatusBadge,
  timeAgo,
} from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted">
        <Icon size={14} className="shrink-0 text-primary" />
        {label}
      </span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, stockInHistory, stockOutHistory, stockAdjustments, deleteProduct } = useData();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const product = useMemo(
    () => products.find((item) => String(item.id) === String(id)),
    [products, id]
  );

  const history = useMemo(() => {
    if (!product) return [];
    const entries = [
      ...stockInHistory
        .filter((entry) => entry.productId === product.id)
        .map((entry) => ({
          id: `in-${entry.id}`,
          icon: FiArrowDownCircle,
          tone: "success",
          title: `${entry.quantity} units received`,
          subtitle: `${entry.supplier} · ${entry.reference}`,
          time: formatDate(entry.date),
          sortDate: entry.date,
          content: (
            <p className="text-xs text-muted">
              {entry.notes || "Stock received"}
              <span className="block pt-0.5 text-white/40">by {entry.user}</span>
            </p>
          ),
        })),
      ...stockOutHistory
        .filter((entry) => entry.productId === product.id)
        .map((entry) => ({
          id: `out-${entry.id}`,
          icon: FiArrowUpCircle,
          tone: "danger",
          title: `${entry.quantity} units dispatched`,
          subtitle: `${entry.customer} · ${entry.invoice}`,
          time: formatDate(entry.date),
          sortDate: entry.date,
          content: (
            <p className="text-xs text-muted">
              {entry.notes || "Stock dispatched"}
              <span className="block pt-0.5 text-white/40">by {entry.user}</span>
            </p>
          ),
        })),
      ...stockAdjustments
        .filter((entry) => entry.productId === product.id)
        .map((entry) => {
          const activity = getActivityBadge(entry.type);
          return {
            id: `adj-${entry.id}`,
            icon: FiTag,
            tone: activity.variant === "success" ? "success" : "warning",
            title: `${entry.quantity} units ${activity.label.toLowerCase()}`,
            subtitle: entry.note,
            time: formatDate(entry.date),
            sortDate: entry.date,
            content: (
              <p className="text-xs text-white/40">by {entry.user}</p>
            ),
          };
        }),
    ];
    return entries.sort((a, b) => b.sortDate - a.sortDate);
  }, [product, stockInHistory, stockOutHistory, stockAdjustments]);

  if (!product) {
    return (
      <EmptyState
        icon={FiPackage}
        title="Product not found"
        description="This product may have been deleted or the link is invalid."
        action={
          <Link to="/dashboard/products">
            <Button leftIcon={FiArrowLeft}>Back to Products</Button>
          </Link>
        }
      />
    );
  }

  const status = getStatusBadge(product.status);
  const margin = product.price - (product.purchasePrice ?? 0);
  const marginPercent = product.price > 0 ? Math.round((margin / product.price) * 100) : 0;

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id);
      showToast.success(`${product.name} was deleted`);
      navigate("/dashboard/products");
    } catch (error) {
      showToast.error(error.message || "Could not delete the product.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/products"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition-colors hover:border-white/20 hover:text-white"
            aria-label="Back to products"
          >
            <FiArrowLeft size={17} />
          </Link>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
                product.color
              )}
            >
              <FiPackage size={20} />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {product.name}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted">{product.sku}</span>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={FiEdit2}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            danger
            leftIcon={FiTrash2}
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-base font-semibold text-white">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {product.description || "No description provided for this product yet."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted">Category</p>
                <p className="mt-1 text-sm font-semibold text-white">{product.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Supplier</p>
                <p className="mt-1 text-sm font-semibold text-white">{product.supplier}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Last updated</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {timeAgo(`${product.updatedAt}T00:00:00`)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Stock level</p>
                <p className={cn("mt-1 text-sm font-semibold", product.stock === 0 ? "text-danger" : product.stock < product.minStock ? "text-warning" : "text-success")}>
                  {product.stock} units
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Stock History</h2>
              <span className="text-xs text-muted">{history.length} events</span>
            </div>
            <div className="mt-5">
              {history.length > 0 ? (
                <Timeline items={history} />
              ) : (
                <p className="py-8 text-center text-sm text-muted">
                  No stock movements recorded for this product yet.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-base font-semibold text-white">Pricing</h2>
            <div className="mt-2 divide-y divide-white/[0.06]">
              <InfoRow icon={FiShoppingBag} label="Selling price" value={formatCurrency(product.price)} />
              <InfoRow icon={FiTruck} label="Cost price" value={formatCurrency(product.purchasePrice ?? 0)} />
              <InfoRow icon={FiDollarSign} label="Profit margin" value={`${formatCurrency(margin)} (${marginPercent}%)`} />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-white">Stock Levels</h2>
            <div className="mt-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted">Current stock</p>
                  <p className="mt-1 text-3xl font-bold text-white">{product.stock}</p>
                </div>
                <p className="text-xs text-muted">Min. {product.minStock}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    product.stock === 0
                      ? "bg-danger"
                      : product.stock < product.minStock
                        ? "bg-warning"
                        : "bg-success"
                  )}
                  style={{
                    width: `${Math.min(100, product.minStock > 0 ? (product.stock / (product.minStock * 2)) * 100 : 100)}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-muted">
                {product.stock < product.minStock
                  ? product.stock === 0
                    ? "This product is out of stock. Restock soon."
                    : "Stock is below the reorder point."
                  : "Stock level is healthy."}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <ProductFormModal open={editOpen} onClose={() => setEditOpen(false)} product={product} />
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete product?"
        message={`"${product.name}" will be permanently removed from your catalog. This action cannot be undone.`}
        confirmLabel="Delete Product"
        tone="danger"
      />
    </div>
  );
}
