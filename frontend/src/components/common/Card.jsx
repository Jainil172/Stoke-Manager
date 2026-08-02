import { cn } from "../../utils/cn.js";

export default function Card({
  children,
  className,
  hover = false,
  glow = false,
  padding = true,
  ...props
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-white/[0.06] bg-card shadow-soft",
        padding && "p-5 sm:p-6",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]",
        glow && "shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
