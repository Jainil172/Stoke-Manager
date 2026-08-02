import { useMemo, useState } from "react";
import {
  FiDownload,
  FiDollarSign,
  FiPercent,
  FiRefreshCw,
  FiTrendingUp,
  FiXCircle,
} from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import CategoryPieChart from "../../components/charts/CategoryPieChart.jsx";
import MonthlyBarChart from "../../components/charts/MonthlyBarChart.jsx";
import StockMovementBarChart from "../../components/charts/StockMovementBarChart.jsx";
import { useData } from "../../context/DataContext.jsx";
import { withPieColors } from "../../services/apiMapper.js";
import { downloadFile, reportFileName } from "../../services/downloadFile.js";
import { showToast } from "../../components/common/Toast.jsx";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Reports() {
  const { products, stockInHistory, stockOutHistory } = useData();
  const [exporting, setExporting] = useState(null);

  const reportStats = useMemo(() => {
    const totalStockValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
    const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = products.filter((product) => product.status === "low-stock").length;
    const outOfStock = products.filter((product) => product.status === "out-of-stock").length;
    const lowStockShare = products.length > 0 ? Math.round(((lowStock + outOfStock) / products.length) * 100) : 0;
    const inbound = stockInHistory.reduce((sum, entry) => sum + entry.quantity, 0);
    const outbound = stockOutHistory.reduce((sum, entry) => sum + entry.quantity, 0);
    const sellThrough = inbound > 0 ? Math.round((outbound / (inbound + outbound)) * 100) : 0;

    const now = new Date();
    const inMonth = (ts, offset) => {
      const target = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const date = new Date(ts);
      return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
    };
    const sumIn = (offset) =>
      stockInHistory.filter((entry) => inMonth(entry.date, offset)).reduce((sum, entry) => sum + entry.quantity, 0);
    const sumOut = (offset) =>
      stockOutHistory.filter((entry) => inMonth(entry.date, offset)).reduce((sum, entry) => sum + entry.quantity, 0);
    const inThisMonth = sumIn(0);
    const inLastMonth = sumIn(1);
    const outThisMonth = sumOut(0);
    const outLastMonth = sumOut(1);
    const pctChange = (current, previous) =>
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

    return [
      { label: "Inventory Value", value: totalStockValue, prefix: "₹", delta: `${totalUnits} units in stock`, icon: FiDollarSign, color: "from-blue-500 to-indigo-600", good: true },
      { label: "Sell-through Rate", value: sellThrough, suffix: "%", delta: `${pctChange(outThisMonth, outLastMonth)}% vs last month`, icon: FiTrendingUp, color: "from-emerald-500 to-teal-600", good: true },
      { label: "Restock Coverage", value: inbound, delta: `${pctChange(inThisMonth, inLastMonth)}% vs last month`, icon: FiRefreshCw, color: "from-violet-500 to-purple-600", good: true },
      { label: "Attention Needed", value: lowStock + outOfStock, delta: `${lowStockShare}% of catalog`, icon: FiXCircle, color: "from-amber-500 to-orange-600", good: false },
    ];
  }, [products, stockInHistory, stockOutHistory]);

  const categoryDistribution = useMemo(() => {
    const map = {};
    products.forEach((product) => {
      map[product.category] = (map[product.category] ?? 0) + 1;
    });
    return withPieColors(
      Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    );
  }, [products]);

  const stockMovement = useMemo(() => {
    const buckets = Array.from({ length: 12 }, () => ({ stockIn: 0, stockOut: 0 }));
    stockInHistory.forEach((entry) => {
      const month = new Date(entry.date).getMonth();
      buckets[month].stockIn += entry.quantity;
    });
    stockOutHistory.forEach((entry) => {
      const month = new Date(entry.date).getMonth();
      buckets[month].stockOut += entry.quantity;
    });
    return buckets
      .map((bucket, index) => ({ month: monthNames[index], ...bucket }))
      .filter((bucket) => bucket.stockIn > 0 || bucket.stockOut > 0);
  }, [stockInHistory, stockOutHistory]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await downloadFile(
        `/reports/${format.toLowerCase()}?scope=catalog`,
        reportFileName(`stockflow-report`, format.toLowerCase())
      );
      showToast.success(`Report exported as ${format}`);
    } catch (error) {
      showToast.error(error.message || `Could not export the ${format} report.`);
    } finally {
      setExporting(null);
    }
  };

  const revenueOverview = useMemo(() => {
    const buckets = Array.from({ length: 12 }, () => ({ revenue: 0, cost: 0 }));
    const priceById = new Map(products.map((product) => [product.id, product]));
    stockOutHistory.forEach((entry) => {
      const month = new Date(entry.date).getMonth();
      const price = priceById.get(entry.productId)?.price ?? 0;
      buckets[month].revenue += entry.quantity * price;
    });
    stockInHistory.forEach((entry) => {
      const month = new Date(entry.date).getMonth();
      const cost = priceById.get(entry.productId)?.purchasePrice ?? 0;
      buckets[month].cost += entry.quantity * cost;
    });
    return buckets
      .map((bucket, index) => ({
        month: monthNames[index],
        revenue: Math.round(bucket.revenue),
        cost: Math.round(bucket.cost),
      }))
      .filter((bucket) => bucket.revenue > 0 || bucket.cost > 0);
  }, [products, stockInHistory, stockOutHistory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Analytics and insights for your operations"
        actions={
          <>
            <Button variant="secondary" leftIcon={FiDownload} onClick={() => handleExport("PDF")} loading={exporting === "PDF"}>
              Export PDF
            </Button>
            <Button variant="secondary" leftIcon={FiDownload} onClick={() => handleExport("CSV")} loading={exporting === "CSV"}>
              Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover className="flex items-center gap-4">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft ${stat.color}`}
              >
                <Icon size={19} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted">{stat.label}</p>
                <p className="text-xl font-bold text-white">
                  {stat.prefix ?? ""}
                  {(stat.value ?? 0).toLocaleString()}
                  {stat.suffix ?? ""}
                </p>
                <p className={stat.good ? "text-[11px] font-medium text-success" : "text-[11px] font-medium text-danger"}>
                  {stat.delta} vs last quarter
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <MonthlyBarChart data={revenueOverview} className="lg:col-span-2" />
        <CategoryPieChart data={categoryDistribution} className="lg:col-span-1" />
        <StockMovementBarChart data={stockMovement} className="lg:col-span-3" />
      </div>
    </div>
  );
}
