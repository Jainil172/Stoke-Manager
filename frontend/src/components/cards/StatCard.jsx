import { motion } from "framer-motion";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import Card from "../common/Card.jsx";
import Counter from "../common/Counter.jsx";
import { cn } from "../../utils/cn.js";

export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
  prefix = null,
  trend = null,
  trendGood = true,
  index = 0,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
    >
      <Card hover className={cn("h-full", className)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted">{label}</p>
            <span className="flex items-baseline gap-1">
              {prefix && <span className="text-xl font-bold text-muted">{prefix}</span>}
              <Counter
                value={value}
                compact={value >= 10000}
                className="mt-2 block text-2xl font-bold tracking-tight text-white lg:text-[1.75rem]"
              />
            </span>
          </div>
          <span
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
              color
            )}
          >
            <Icon size={20} />
          </span>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                trendGood
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              )}
            >
              {trend.startsWith("-") ? <FiTrendingDown size={12} /> : <FiTrendingUp size={12} />}
              {trend}
            </span>
            <span className="text-muted">vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
