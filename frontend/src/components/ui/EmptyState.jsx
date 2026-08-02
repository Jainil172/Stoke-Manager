import { FiInbox } from "react-icons/fi";
import Button from "./Button.jsx";
import { cn } from "../../utils/cn.js";

export default function EmptyState({
  icon: Icon = FiInbox,
  title = "Nothing here yet",
  description = "No data found for this view.",
  action = null,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-muted">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
