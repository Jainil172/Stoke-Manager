import { useMemo, useState } from "react";
import {
  FiArrowDownCircle,
  FiDownload,
  FiPackage,
  FiPlus,
  FiTruck,
} from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import Dropdown from "../../components/ui/Dropdown.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StockEntryModal from "../../components/modals/StockEntryModal.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { showToast } from "../../components/common/Toast.jsx";
import { downloadFile, reportFileName } from "../../services/downloadFile.js";
import { formatDate } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

export default function StockIn() {
  const { products, stockInHistory, suppliers } = useData();
  const [query, setQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState({ label: "All suppliers", value: "all" });
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const debouncedQuery = useDebounce(query, 200);

  const totalReceived = stockInHistory.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalOrders = stockInHistory.length;

  const supplierOptions = useMemo(
    () => [
      { label: "All suppliers", value: "all" },
      ...suppliers.map((supplier) => ({ label: supplier.company, value: supplier.company })),
    ],
    [suppliers]
  );

  const filtered = useMemo(() => {
    return stockInHistory.filter((entry) => {
      const product = products.find((item) => item.id === entry.productId);
      const productName = product?.name ?? "";
      const matchesQuery =
        !debouncedQuery.trim() ||
        productName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        entry.reference.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        entry.supplier.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesSupplier =
        supplierFilter.value === "all" || entry.supplier === supplierFilter.value;
      return matchesQuery && matchesSupplier;
    });
  }, [stockInHistory, products, debouncedQuery, supplierFilter]);

  const columns = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      sortValue: (entry) => products.find((item) => item.id === entry.productId)?.name ?? "",
      render: (entry) => {
        const product = products.find((item) => item.id === entry.productId);
        return (
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white",
                product?.color
              )}
            >
              <FiPackage size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{product?.name ?? "Unknown product"}</p>
              <p className="text-xs text-muted">{product?.sku}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "supplier",
      header: "Supplier",
      hideOnMobile: true,
      sortable: true,
      render: (entry) => (
        <span className="inline-flex items-center gap-2 text-muted">
          <FiTruck size={13} className="shrink-0 text-primary" />
          {entry.supplier}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      align: "right",
      sortable: true,
      render: (entry) => <span className="font-semibold text-success">+{entry.quantity}</span>,
    },
    {
      key: "reference",
      header: "Reference",
      hideOnMobile: true,
      render: (entry) => <span className="font-mono text-xs text-muted">{entry.reference}</span>,
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      sortable: true,
      sortValue: (entry) => entry.date,
      render: (entry) => <span className="text-muted">{formatDate(entry.date)}</span>,
    },
    {
      key: "user",
      header: "Recorded by",
      align: "right",
      render: (entry) => <span className="text-muted">{entry.user}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock In"
        subtitle="Purchases and inbound shipments"
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={FiDownload}
              loading={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  await downloadFile("/reports/csv?scope=stock-in", reportFileName("stockflow-stock-in-report", "csv"));
                  showToast.success("Stock-in report exported as CSV");
                } catch (error) {
                  showToast.error(error.message || "Could not export the report.");
                } finally {
                  setExporting(false);
                }
              }}
            >
              Export
            </Button>
            <Button leftIcon={FiPlus} onClick={() => setModalOpen(true)}>
              Record Stock In
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total units received"
          value={totalReceived}
          icon={FiArrowDownCircle}
          color="from-emerald-500 to-teal-600"
          index={0}
        />
        <StatCard
          label="Inbound orders"
          value={totalOrders}
          icon={FiTruck}
          color="from-blue-500 to-indigo-600"
          index={1}
        />
        <StatCard
          label="Active suppliers"
          value={suppliers.length}
          icon={FiPackage}
          color="from-amber-500 to-orange-600"
          index={2}
        />
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search product, reference or supplier..."
            className="w-full sm:max-w-xs"
          />
          <Dropdown
            width="w-52"
            trigger={
              <span className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white transition-colors hover:border-white/20">
                {supplierFilter.label}
              </span>
            }
            items={supplierOptions.map((option) => ({
              key: `supplier-${option.value}`,
              label: option.label,
              onClick: () => setSupplierFilter(option),
            }))}
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          defaultSortKey="date"
          defaultSortDir="desc"
          emptyMessage="No inbound shipments found."
          itemsPerPage={8}
        />
      </Card>

      <StockEntryModal open={modalOpen} onClose={() => setModalOpen(false)} type="in" />
    </div>
  );
}
