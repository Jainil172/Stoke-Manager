import { Link } from "react-router-dom";
import { FiPackage } from "react-icons/fi";
import { cn } from "../../utils/cn.js";

export function Logo({ withText = true, size = "md", className }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow transition-transform duration-300 group-hover:scale-105",
          size === "lg" ? "h-11 w-11" : "h-9 w-9"
        )}
      >
        <FiPackage size={size === "lg" ? 22 : 18} className="text-white" />
      </span>
      {withText && (
        <span className={cn("font-extrabold tracking-tight", size === "lg" ? "text-xl" : "text-lg")}>
          Stock<span className="text-secondary">Flow</span>
        </span>
      )}
    </Link>
  );
}
