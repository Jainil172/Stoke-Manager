import { useMemo, useState } from "react";
import {
  FiArrowUpCircle,
  FiDownload,
  FiPackage,
  FiPlus,
  FiUsers,
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
import { formatCurrency, formatDate } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

export default function StockOut() {
  const { products, stockOutHistory } = useData();
  const [query, setQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState({ label: "All customers", value: "all" });
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const debouncedQuery = useDebounce(query, 200);

  const totalDispatched = stockOutHistory.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalInvoices = stockOutHistory.length;
  const totalValue = useMemo(
    () =>
      stockOutHistory.reduce((sum, entry) => {
        const product = products.find((item) => item.id === entry.productId);
        return sum + (product?.price ?? 0) * entry.quantity;
      }, 0),
    [stockOutHistory, products]
  );

  const customerOptions = useMemo(() => {
    const unique = [...new Set(stockOutHistory.map((entry) => entry.customer))];
    return [
      { label: "All customers", value: "all" },
      ...unique.map((customer) => ({ label: customer, value: customer })),
    ];
  }, [stockOutHistory]);

  const filtered = useMemo(() => {
    return stockOutHistory.filter((entry) => {
      const product = products.find((item) => item.id === entry.productId);
      const productName = product?.name ?? "";
      const matchesQuery =
        !debouncedQuery.trim() ||
        productName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        entry.invoice.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        entry.customer.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesCustomer =
        customerFilter.value === "all" || entry.customer === customerFilter.value;
      return matchesQuery && matchesCustomer;
    });
  }, [stockOutHistory, products, debouncedQuery, customerFilter]);

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
      key: "customer",
      header: "Customer",
      hideOnMobile: true,
      sortable: true,
      render: (entry) => (
        <span className="inline-flex items-center gap-2 text-muted">
          <FiUsers size={13} className="shrink-0 text-primary" />
          {entry.customer}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      align: "right",
      sortable: true,
      render: (entry) => <span className="font-semibold text-danger">-{entry.quantity}</span>,
    },
    {
      key: "invoice",
      header: "Invoice",
      hideOnMobile: true,
      render: (entry) => <span className="font-mono text-xs text-muted">{entry.invoice}</span>,
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      hideOnMobile: true,
      sortable: true,
      sortValue: (entry) => {
        const product = products.find((item) => item.id === entry.productId);
        return (product?.price ?? 0) * entry.quantity;
      },
      render: (entry) => {
        const product = products.find((item) => item.id === entry.productId);
        return <span className="font-medium text-white">{formatCurrency((product?.price ?? 0) * entry.quantity)}</span>;
      },
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      sortable: true,
      sortValue: (entry) => entry.date,
      render: (entry) => <span className="text-muted">{formatDate(entry.date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Out"
        subtitle="Sales and outbound shipments"
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={FiDownload}
              loading={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  await downloadFile("/reports/csv?scope=stock-out", reportFileName("stockflow-stock-out-report", "csv"));
                  showToast.success("Stock-out report exported as CSV");
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
              Record Stock Out
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Units dispatched"
          value={totalDispatched}
          icon={FiArrowUpCircle}
          color="from-rose-500 to-pink-600"
          index={0}
        />
        <StatCard
          label="Outbound invoices"
          value={totalInvoices}
          icon={FiUsers}
          color="from-blue-500 to-indigo-600"
          index={1}
        />
        <StatCard
          label="Sales value"
          value={totalValue}
          prefix="₹"
          icon={FiPackage}
          color="from-emerald-500 to-teal-600"
          index={2}
        />
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search product, invoice or customer..."
            className="w-full sm:max-w-xs"
          />
          <Dropdown
            width="w-52"
            trigger={
              <span className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white transition-colors hover:border-white/20">
                {customerFilter.label}
              </span>
            }
            items={customerOptions.map((option) => ({
              key: `customer-${option.value}`,
              label: option.label,
              onClick: () => setCustomerFilter(option),
            }))}
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          defaultSortKey="date"
          defaultSortDir="desc"
          emptyMessage="No outbound shipments found."
          itemsPerPage={8}
        />
      </Card>

      <StockEntryModal open={modalOpen} onClose={() => setModalOpen(false)} type="out" />
    </div>
  );
}
