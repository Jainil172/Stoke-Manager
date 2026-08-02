import { formatCompact, formatCurrency } from "../../utils/format.js";

export default function ChartTooltip({ active, payload, label, currency = false }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-card/95 px-4 py-3 shadow-soft backdrop-blur-xl">
      {label && <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>}
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const color = entry.color ?? entry.stroke ?? "#60A5FA";
          return (
            <div key={`${entry.dataKey}-${entry.name}`} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize text-muted">{entry.name}</span>
              <span className="ml-auto pl-6 font-semibold text-white">
                {currency ? formatCurrency(entry.value) : formatCompact(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
