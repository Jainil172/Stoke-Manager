import { motion } from "framer-motion";
import { Logo } from "../common/Logo.jsx";
import { cn } from "../../utils/cn.js";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export default function Loader({ size = "md", label, fullScreen = false, className }) {
  const spinner = (
    <span
      className={cn(
        "animate-spin rounded-full border-primary/30 border-t-primary",
        sizes[size],
        className
      )}
      role="status"
      aria-label={label ?? "Loading"}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo />
        </motion.div>
        {spinner}
        {label && <p className="text-sm text-muted">{label}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {spinner}
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}
