import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import Card from "../common/Card.jsx";
import { cn } from "../../utils/cn.js";

export default function QuickActionCard({ label, description, icon: Icon, color, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="block w-full text-left"
    >
      <Card hover className="group flex h-full items-center gap-4">
        <span
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
            color
          )}
        >
          <Icon size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white">{label}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">{description}</span>
        </span>
        <FiArrowUpRight
          size={17}
          className="shrink-0 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-secondary"
        />
      </Card>
    </motion.button>
  );
}
