import { cn } from "../../utils/cn.js";

const toneClasses = {
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  neutral: "bg-white/[0.06] text-muted border-white/10",
};

export default function Timeline({ items = [], className }) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;
        return (
          <li key={item.id ?? index} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border",
                  toneClasses[item.tone ?? "neutral"]
                )}
              >
                {Icon && <Icon size={15} />}
              </span>
              {!isLast && (
                <span className="mt-1 w-px flex-1 bg-white/[0.08]" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.time && <span className="text-xs text-muted">{item.time}</span>}
              </div>
              {item.subtitle && <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>}
              {item.content && <div className="mt-2">{item.content}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
