import { cn } from "../../utils/cn.js";

const variants = {
  success: "bg-success/10 border-success/25 text-success",
  warning: "bg-warning/10 border-warning/25 text-warning",
  danger: "bg-danger/10 border-danger/25 text-danger",
  primary: "bg-primary/10 border-primary/25 text-secondary",
  neutral: "bg-white/[0.06] border-white/10 text-muted",
};

const dotColors = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  primary: "bg-secondary",
  neutral: "bg-muted",
};

export default function Badge({ variant = "neutral", dot = false, children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
