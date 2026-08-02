import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiPackage } from "react-icons/fi";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import Card from "../../../components/common/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import api from "../../../services/api.js";
import { formatCompact, formatCurrency, getGradient, getStatusBadge } from "../../../utils/format.js";
import { cn } from "../../../utils/cn.js";

const fallbackBars = [45, 68, 54, 82, 60, 90, 72];

export default function DashboardPreview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/stats")
      .then(({ data }) => {
        if (!cancelled) setStats(data.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = stats?.totals;
  const monthly = stats?.monthly ?? [];
  const recentProducts = stats?.recentProducts ?? [];

  const previewMonths = monthly.slice(-7);
  const revenueValues = previewMonths.map((entry) => Number(entry.revenue) || 0);
  const maxRevenue = Math.max(...revenueValues, 1);
  const previewBars =
    revenueValues.length > 0
      ? revenueValues.map((value) => Math.max(10, Math.round((value / maxRevenue) * 100)))
      : fallbackBars;

  const periodRevenue = revenueValues.reduce((sum, value) => sum + value, 0);
  const monthLabels = previewMonths.length > 0 ? previewMonths.map((entry) => entry.month) : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  return (
    <section id="preview" className="relative py-20 sm:py-28">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Dashboard Preview"
          title="A dashboard your team will actually love"
          description="Real-time stats, beautiful charts, and clean tables — every number your operations team needs, one click away."
        />

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mt-14"
        >
          <div
            className="pointer-events-none absolute -inset-6 rounded-[36px] bg-gradient-to-b from-primary/15 to-transparent blur-2xl"
            aria-hidden="true"
          />
          <Card className="relative overflow-hidden p-0 shadow-glow">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 hidden rounded-lg bg-white/[0.05] px-3 py-1 text-[11px] text-muted sm:block">
                app.stockflow.io/dashboard
              </span>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-white">Revenue overview</h4>
                    <p className="mt-0.5 text-xs text-muted">Sales performance · last 7 months</p>
                  </div>
                  <Badge variant="success" dot>
                    {periodRevenue > 0 ? `₹${formatCompact(periodRevenue)} total` : "Live"}
                  </Badge>
                </div>
                <div className="mt-5 flex h-48 items-end gap-2 sm:gap-3">
                  {previewBars.map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.25 + index * 0.07, duration: 0.5, ease: "easeOut" }}
                      className={cn(
                        "flex-1 rounded-t-lg",
                        index === previewBars.length - 1
                          ? "bg-gradient-to-t from-primary to-secondary"
                          : "bg-white/[0.08]"
                      )}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-medium text-white/30 uppercase">
                  {monthLabels.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs text-muted">Total Products</p>
                    <p className="mt-1.5 text-2xl font-bold text-white">
                      {totals ? formatCompact(totals.totalProducts) : "—"}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-success">
                      {totals ? `${totals.suppliers} suppliers` : "live from your data"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs text-muted">Low Stock</p>
                    <p className="mt-1.5 text-2xl font-bold text-white">
                      {totals ? formatCompact(totals.lowStock) : "—"}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-success">
                      {totals ? `${totals.outOfStock} out of stock` : "live from your data"}
                    </p>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
                    Recent products
                  </p>
                  <div className="space-y-2.5">
                    {recentProducts.slice(0, 4).map((product) => {
                      const status = getStatusBadge(product.status);
                      return (
                        <div key={product.id} className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white",
                              getGradient(product.name)
                            )}
                          >
                            <FiPackage size={14} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-white">
                            {product.name}
                          </span>
                          <span className="text-xs font-semibold text-muted">
                            {formatCurrency(product.price)}
                          </span>
                          <Badge variant={status.variant} className="px-2 py-0 text-[10px]">
                            {status.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
