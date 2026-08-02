import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../common/Card.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { cn } from "../../utils/cn.js";

const axisTickStyle = { fill: "#94A3B8", fontSize: 11 };

export default function TrendLineChart({
  data,
  title = "Stock Movement",
  subtitle = "Units in vs units out · last 8 months",
  className,
}) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            Stock In
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            Stock Out
          </span>
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="areaStockIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="month"
              tick={axisTickStyle}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
            <Area
              type="monotone"
              dataKey="stockIn"
              stroke="none"
              fill="url(#areaStockIn)"
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="stockIn"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#22C55E", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="stockOut"
              stroke="#EF4444"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: "#EF4444", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
