import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../common/Card.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { cn } from "../../utils/cn.js";
import { formatNumber } from "../../utils/format.js";

export default function CategoryPieChart({ data, title = "Stock by Category", subtitle = "Distribution across categories", className }) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </div>

      <div className="relative mx-auto mt-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatNumber(total)}</p>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Units</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {data.map((entry) => {
          const percentage = Math.round((entry.value / total) * 100);
          return (
            <div key={entry.name} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1 truncate text-muted">{entry.name}</span>
              <span className="font-medium text-white">{formatNumber(entry.value)}</span>
              <span className="w-10 text-right text-xs text-white/40">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
