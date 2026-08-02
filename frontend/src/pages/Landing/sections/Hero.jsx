import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiPlay, FiStar } from "react-icons/fi";
import Button from "../../../components/ui/Button.jsx";
import Avatar from "../../../components/ui/Avatar.jsx";
import Card from "../../../components/common/Card.jsx";
import api from "../../../services/api.js";
import { formatCompact, formatNumber, getStatusBadge } from "../../../utils/format.js";

const barHeights = [40, 62, 48, 78, 58, 92, 70, 52, 84, 64, 88, 74];

const trustAvatars = ["Aarav Sharma", "Priya Patel", "Rahul Verma", "Ananya Iyer", "Vikram Singh"];

export default function Hero() {
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

  const miniStats = [
    {
      label: "Total SKUs",
      value: totals ? formatNumber(totals.totalProducts) : "—",
      color: "from-blue-500 to-indigo-600",
      icon: null,
    },
    {
      label: "Low Stock",
      value: totals ? formatNumber(totals.lowStock) : "—",
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "Inventory Value",
      value: totals ? `₹${formatCompact(totals.inventoryValue)}` : "—",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const revenueValues = monthly.map((entry) => Number(entry.revenue) || 0);
  const maxRevenue = Math.max(...revenueValues, 1);
  const liveBars =
    revenueValues.length > 0
      ? revenueValues.map((value) => Math.max(8, Math.round((value / maxRevenue) * 100)))
      : barHeights;

  const alertProduct = recentProducts.find((product) =>
    ["low-stock", "out-of-stock"].includes(product.status)
  );
  const latestMonthIn = monthly.length > 0 ? Number(monthly[monthly.length - 1].in) || 0 : 0;
  const showcaseProducts =
    recentProducts.length >= 2 ? recentProducts.slice(0, 2) : null;
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-secondary"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              New — StockFlow 2.0 is here
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.6rem] lg:leading-[1.08]"
            >
              Manage Inventory{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Smarter.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0"
            >
              Track stock levels, suppliers, and sales in one beautiful dashboard. StockFlow helps
              growing teams stay ahead — without the spreadsheet chaos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={FiArrowRight}>
                  Get Started Free
                </Button>
              </Link>
              <a href="#preview" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" leftIcon={FiPlay} className="w-full sm:w-auto">
                  View Live Demo
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <div className="flex -space-x-2.5">
                {trustAvatars.map((name) => (
                  <Avatar key={name} name={name} size="sm" className="ring-2 ring-background" />
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center gap-1 sm:justify-start">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar key={index} size={14} className="fill-warning text-warning" />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-white">4.9/5</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Trusted by {formatNumber(12000)}+ teams worldwide
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div
              className="pointer-events-none absolute -inset-8 rounded-[40px] bg-gradient-to-tr from-primary/25 via-secondary/10 to-transparent blur-2xl"
              aria-hidden="true"
            />
            <Card className="relative p-4 shadow-glow sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  StockFlow · Overview
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {miniStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.12, duration: 0.4 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3"
                  >
                    <p className="truncate text-[11px] font-medium text-muted">{stat.label}</p>
                    <p
                      className={`mt-1.5 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
                  Monthly revenue
                </p>
                <div className="flex h-28 items-end gap-1.5 sm:gap-2">
                  {liveBars.map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.7 + index * 0.05, duration: 0.5, ease: "easeOut" }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-secondary"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {showcaseProducts &&
                  showcaseProducts.map((product) => {
                    const status = getStatusBadge(product.status);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white">
                            {product.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-xs font-medium text-white sm:text-sm">
                            {product.name}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            status.variant === "success"
                              ? "border border-success/25 bg-success/10 text-success"
                              : status.variant === "warning"
                                ? "border border-warning/25 bg-warning/10 text-warning"
                                : "border border-danger/25 bg-danger/10 text-danger"
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </Card>

            {alertProduct && (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-5 -right-3 rounded-2xl border border-warning/25 bg-card px-3.5 py-2.5 shadow-soft sm:-right-6"
              >
                <p className="text-[11px] font-semibold text-warning">Stock alert</p>
                <p className="mt-0.5 text-[11px] text-muted">{alertProduct.name} needs restock</p>
              </motion.div>
            )}

            {latestMonthIn > 0 && (
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute -bottom-5 -left-3 rounded-2xl border border-success/25 bg-card px-3.5 py-2.5 shadow-soft sm:-left-6"
              >
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
                  <FiCheckCircle size={12} />
                  +{formatNumber(latestMonthIn)} units received
                </p>
                <p className="mt-0.5 text-[11px] text-muted">this month</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
