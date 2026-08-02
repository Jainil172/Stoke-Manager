import { FiAlertCircle } from "react-icons/fi";
import { cn } from "../../utils/cn.js";

export default function Textarea({
  label,
  error,
  className,
  rows = 4,
  ...props
}) {
  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium text-muted">{label}</label>}
      <textarea
        rows={rows}
        className={cn(
          "w-full resize-none rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-200 hover:bg-white/[0.05] focus:bg-white/[0.05]",
          error
            ? "border-danger/60 focus:border-danger focus:ring-2 focus:ring-danger/20"
            : "border-white/10 hover:border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger">
          <FiAlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
