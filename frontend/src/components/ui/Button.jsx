import { motion } from "framer-motion";
import { cn } from "../../utils/cn.js";

const variants = {
  primary:
    "bg-primary text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.55)] hover:bg-primary/90",
  secondary: "bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.1]",
  outline: "border border-primary/40 text-secondary hover:bg-primary/10",
  ghost: "text-muted hover:bg-white/[0.06] hover:text-white",
  danger: "bg-danger text-white shadow-[0_8px_24px_-8px_rgba(239,68,68,0.55)] hover:bg-danger/90",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function Spinner({ size = "h-4 w-4", light = true }) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-t-transparent",
        size,
        light ? "border-white/40" : "border-primary/30"
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  children,
  className,
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {LeftIcon && <LeftIcon size={18} />}
          {children}
          {RightIcon && <RightIcon size={16} />}
        </>
      )}
    </motion.button>
  );
}
