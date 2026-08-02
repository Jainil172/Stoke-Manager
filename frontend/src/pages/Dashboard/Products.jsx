import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDownload,
  FiEdit2,
  FiEye,
  FiFilter,
  FiPackage,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Dropdown from "../../components/ui/Dropdown.jsx";
import Badge from "../../components/ui/Badge.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import ActionMenu from "../../components/ui/ActionMenu.jsx";
import FilterDrawer from "../../components/ui/FilterDrawer.jsx";
import ProductFormModal from "../../components/modals/ProductFormModal.jsx";
import ConfirmationDialog from "../../components/common/ConfirmationDialog.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { showToast } from "../../components/common/Toast.jsx";
import { downloadFile, reportFileName } from "../../services/downloadFile.js";
import { formatCurrency, getStatusBadge } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const statusFilters = [
  { label: "All statuses", value: "all" },
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

const initialFilters = { category: "all", minStockOnly: false };

export default function Products() {
  const navigate = useNavigate();
  const { products, categories, deleteProduct } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFilters[0]);
  const [filters, setFilters] = useState(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [exporting, setExporting] = useState(false);
  const debouncedQuery = useDebounce(query, 200);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        !debouncedQuery.trim() ||
        product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesStatus =
        statusFilter.value === "all" || product.status === statusFilter.value;
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      const matchesMinStock = !filters.minStockOnly || product.stock <= product.minStock;
      return matchesQuery && matchesStatus && matchesCategory && matchesMinStock;
    });
  }, [products, debouncedQuery, statusFilter, filters]);

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.minStockOnly ||
    statusFilter.value !== "all" ||
    Boolean(debouncedQuery.trim());

  const openAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id);
      showToast.success(`${deletingProduct.name} was deleted`);
    } catch (error) {
      showToast.error(error.message || "Could not delete the product.");
    }
    setDeletingProduct(null);
  };

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
      key: "category",
      header: "Category",
      hideOnMobile: true,
      sortable: true,
      render: (product) => <span className="text-muted">{product.category}</span>,
    },
    {
      key: "supplier",
      header: "Supplier",
      hideOnMobile: true,
      sortable: true,
      render: (product) => <span className="text-muted">{product.supplier}</span>,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      sortable: true,
      sortValue: (product) => product.price,
      render: (product) => <span className="font-medium text-white">{formatCurrency(product.price)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      sortable: true,
      sortValue: (product) => product.stock,
      render: (product) => <span className="text-muted">{product.stock}</span>,
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
    {
      key: "actions",
      header: "",
      align: "right",
      render: (product) => (
        <ActionMenu
          items={[
            {
              key: "view",
              label: "View details",
              icon: FiEye,
              onClick: () => navigate(`/dashboard/products/${product.id}`),
            },
            {
              key: "edit",
              label: "Edit",
              icon: FiEdit2,
              onClick: () => openEdit(product),
            },
            {
              key: "delete",
              label: "Delete",
              icon: FiTrash2,
              danger: true,
              onClick: () => setDeletingProduct(product),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in your catalog`}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={FiDownload}
              loading={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  await downloadFile("/reports/csv?scope=catalog", reportFileName("stockflow-catalog-report", "csv"));
                  showToast.success("Catalog exported as CSV");
                } catch (error) {
                  showToast.error(error.message || "Could not export the catalog.");
                } finally {
                  setExporting(false);
                }
              }}
            >
              Export
            </Button>
            <Button leftIcon={FiPlus} onClick={openAdd}>
              Add Product
            </Button>
          </>
        }
      />

      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by name or SKU..."
            className="w-full sm:max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={FiFilter}
              className={cn(hasActiveFilters && "border-primary/50 text-primary")}
              onClick={() => {
                setDraftFilters(filters);
                setFilterOpen(true);
              }}
            >
              Filters
              {hasActiveFilters && (
                <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {Object.entries(filters).filter(([, v]) => v !== "all" && v !== false).length + (statusFilter.value !== "all" ? 1 : 0)}
                </span>
              )}
            </Button>
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
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          defaultSortKey="name"
          emptyMessage="No products match your filters."
          itemsPerPage={8}
        />
      </Card>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setFilters(draftFilters);
          setFilterOpen(false);
        }}
        onReset={() => {
          setDraftFilters(initialFilters);
          setFilters(initialFilters);
          setFilterOpen(false);
        }}
      >
        <div className="space-y-6">
          <div>
            <p className="mb-2.5 text-sm font-medium text-muted">Category</p>
            <Dropdown
              width="w-full"
              align="left"
              trigger={
                <span className="flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white transition-all duration-200">
                  {draftFilters.category === "all" ? "All categories" : draftFilters.category}
                </span>
              }
              items={[
                { key: "cat-all", label: "All categories", onClick: () => setDraftFilters((prev) => ({ ...prev, category: "all" })) },
                ...categories.map((category) => ({
                  key: `cat-${category.id}`,
                  label: category.name,
                  onClick: () => setDraftFilters((prev) => ({ ...prev, category: category.name })),
                })),
              ]}
            />
          </div>

          <div>
            <p className="mb-2.5 text-sm font-medium text-muted">Stock level</p>
            <div className="space-y-2.5">
              {[
                { label: "All stock levels", value: false },
                { label: "At or below reorder point", value: true },
              ].map((option) => (
                <label
                  key={String(option.value)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/20"
                >
                  <input
                    type="radio"
                    name="stock-level"
                    checked={draftFilters.minStockOnly === option.value}
                    onChange={() => setDraftFilters((prev) => ({ ...prev, minStockOnly: option.value }))}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="text-sm text-white">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FilterDrawer>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
      />
      <ConfirmationDialog
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        message={`"${deletingProduct?.name}" will be permanently removed from your catalog. This action cannot be undone.`}
        confirmLabel="Delete Product"
        tone="danger"
      />
    </div>
  );
}
