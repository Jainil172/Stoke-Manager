import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiBarChart2, FiCheckCircle, FiZap } from "react-icons/fi";
import { Logo } from "../common/Logo.jsx";

const brandPoints = [
  { icon: FiCheckCircle, text: "Real-time stock levels across every warehouse" },
  { icon: FiZap, text: "Instant low-stock and reorder alerts" },
  { icon: FiBarChart2, text: "Beautiful, exportable reports and analytics" },
];

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative hidden flex-col justify-between p-12 lg:flex xl:p-16">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-white"
        >
          <FiArrowLeft size={15} />
          Back to home
        </Link>

        <div>
          <Logo size="lg" />
          <h1 className="mt-8 max-w-md text-4xl leading-[1.15] font-bold tracking-tight xl:text-[2.75rem]">
            Inventory management,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              without the chaos.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            Join 12,000+ teams who keep their stock, suppliers, and reports in one beautifully
            simple workspace.
          </p>

          <div className="mt-10 space-y-4">
            {brandPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.text} className="flex items-center gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-secondary">
                    <Icon size={17} />
                  </span>
                  <p className="text-sm font-medium text-white/85">{point.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-card border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-muted italic">
            "StockFlow replaced three spreadsheets and a shared doc. Our inventory is finally under
            control."
          </p>
          <p className="mt-4 text-sm font-semibold text-white">
            Maya Patel
            <span className="ml-2 font-normal text-muted">COO, Northwind Goods</span>
          </p>
        </div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="mb-8 lg:hidden">
              <Logo size="lg" />
            </div>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
