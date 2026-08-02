import { FiSearch, FiX } from "react-icons/fi";
import { cn } from "../../utils/cn.js";

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className,
  ...props
}) {
  return (
    <div className={cn("relative", className)}>
      <FiSearch size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pr-10 pl-11 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 hover:border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-white"
          aria-label="Clear search"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}
