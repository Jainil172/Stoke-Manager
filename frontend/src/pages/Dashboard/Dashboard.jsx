import { useEffect, useMemo, useState } from "react";
import { FiAlertOctagon, FiAlertTriangle, FiDownload, FiGrid, FiPackage, FiPlus, FiTruck } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import QuickActionCard from "../../components/cards/QuickActionCard.jsx";
import CategoryPieChart from "../../components/charts/CategoryPieChart.jsx";
import MonthlyBarChart from "../../components/charts/MonthlyBarChart.jsx";
import TrendLineChart from "../../components/charts/TrendLineChart.jsx";
import RecentProductsTable from "../../components/tables/RecentProductsTable.jsx";
import StockActivityTable from "../../components/tables/StockActivityTable.jsx";
import ProductFormModal from "../../components/modals/ProductFormModal.jsx";
import SupplierFormModal from "../../components/modals/SupplierFormModal.jsx";
import StockEntryModal from "../../components/modals/StockEntryModal.jsx";
import { useData } from "../../context/DataContext.jsx";
import { withPieColors } from "../../services/apiMapper.js";
import { downloadFile, reportFileName } from "../../services/downloadFile.js";
import { showToast } from "../../components/common/Toast.jsx";

const statItems = [
  { key: "totalProducts", label: "Total Products", icon: FiPackage, color: "from-blue-500 to-indigo-600" },
  { key: "categories", label: "Categories", icon: FiGrid, color: "from-violet-500 to-purple-600" },
  { key: "suppliers", label: "Suppliers", icon: FiTruck, color: "from-emerald-500 to-teal-600" },
  { key: "lowStock", label: "Low Stock", icon: FiAlertTriangle, color: "from-amber-500 to-orange-600" },
  { key: "outOfStock", label: "Out of Stock", icon: FiAlertOctagon, color: "from-rose-500 to-red-600" },
];

export default function Dashboard() {
  const { products, categories, suppliers, stockInHistory, stockOutHistory, stockAdjustments, fetchDashboard, fetchAnalytics } = useData();
  const [modal, setModal] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dashboard, setDashboard] = useState({ recentActivities: [] });
  const [analytics, setAnalytics] = useState({
    monthly: [],
    categoryDistribution: [],
    supplierDistribution: [],
    inventoryValueTrend: [],
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDashboard(), fetchAnalytics()])
      .then(([summary, analyticsData]) => {
        if (cancelled) return;
        setDashboard(summary);
        setAnalytics(analyticsData);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fetchDashboard, fetchAnalytics]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    categories: categories.length,
    suppliers: suppliers.length,
    lowStock: products.filter((product) => product.status === "low-stock").length,
    outOfStock: products.filter((product) => product.status === "out-of-stock").length,
  }), [products, categories, suppliers]);

  const categoryDistribution = useMemo(
    () => withPieColors(analytics.categoryDistribution),
    [analytics.categoryDistribution]
  );

  const monthlyRevenue = useMemo(
    () =>
      analytics.monthly.map(({ month, revenue, cost }) => ({
        month,
        revenue: Math.round(revenue || 0),
        cost: Math.round(cost || 0),
      })),
    [analytics.monthly]
  );

  const stockTrend = useMemo(
    () =>
      analytics.monthly.map(({ month, stockIn, stockOut }) => ({
        month,
        stockIn,
        stockOut,
      })),
    [analytics.monthly]
  );

  const recentProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
        .slice(0, 5),
    [products]
  );

  const recentActivities = useMemo(() => {
    if (dashboard.recentActivities.length > 0) return dashboard.recentActivities;
    const productName = (id) => products.find((item) => item.id === id)?.name ?? "Unknown product";
    const entries = [
      ...stockInHistory.map((entry) => ({
        id: `in-${entry.id}`,
        product: productName(entry.productId),
        type: "stock-in",
        quantity: entry.quantity,
        note: `${entry.reference} · ${entry.notes || "Received"}`,
        user: entry.user,
        time: entry.date,
      })),
      ...stockOutHistory.map((entry) => ({
        id: `out-${entry.id}`,
        product: productName(entry.productId),
        type: "stock-out",
        quantity: entry.quantity,
        note: `${entry.invoice} · ${entry.notes || "Dispatched"}`,
        user: entry.user,
        time: entry.date,
      })),
      ...stockAdjustments.map((entry) => ({
        id: `adj-${entry.id}`,
        product: productName(entry.productId),
        type: entry.type,
        quantity: entry.quantity,
        note: entry.note,
        user: entry.user,
        time: entry.date,
      })),
    ];
    return entries.sort((a, b) => b.time - a.time).slice(0, 7);
  }, [products, stockInHistory, stockOutHistory, stockAdjustments, dashboard.recentActivities]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile("/reports/pdf", reportFileName("stockflow-report", "pdf"));
      showToast.success("Report exported as PDF");
    } catch (error) {
      showToast.error(error.message || "Could not export the report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your inventory at a glance"
        actions={
          <>
            <Button variant="secondary" leftIcon={FiDownload} onClick={handleExport} loading={exporting}>
              Export Report
            </Button>
            <Button leftIcon={FiPlus} onClick={() => setModal("product")}>
              Add Product
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 lg:gap-5">
        {statItems.map((item, index) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={stats[item.key]}
            icon={item.icon}
            color={item.color}
            index={index}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <CategoryPieChart data={categoryDistribution} className="lg:col-span-1" />
        <MonthlyBarChart data={monthlyRevenue} className="lg:col-span-2" />
        <TrendLineChart data={stockTrend} className="lg:col-span-3" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentProductsTable data={recentProducts} />
        </div>
        <StockActivityTable data={recentActivities} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Quick Actions</h3>
            <p className="mt-0.5 text-xs text-muted">Common tasks, one click away</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            label="Add Product"
            description="Create a new SKU"
            icon={FiPackage}
            color="from-blue-500 to-indigo-600"
            onClick={() => setModal("product")}
          />
          <QuickActionCard
            label="Add Supplier"
            description="Register a vendor"
            icon={FiTruck}
            color="from-emerald-500 to-teal-600"
            onClick={() => setModal("supplier")}
          />
          <QuickActionCard
            label="Stock In"
            description="Receive a shipment"
            icon={FiPlus}
            color="from-amber-500 to-orange-600"
            onClick={() => setModal("stock-in")}
          />
          <QuickActionCard
            label="Stock Out"
            description="Release stock"
            icon={FiAlertTriangle}
            color="from-rose-500 to-red-600"
            onClick={() => setModal("stock-out")}
          />
        </div>
      </div>

      <ProductFormModal open={modal === "product"} onClose={() => setModal(null)} />
      <SupplierFormModal open={modal === "supplier"} onClose={() => setModal(null)} />
      <StockEntryModal
        open={modal === "stock-in" || modal === "stock-out"}
        type={modal === "stock-out" ? "out" : "in"}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
