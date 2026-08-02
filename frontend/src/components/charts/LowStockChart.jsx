import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../common/Card.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import { cn } from "../../utils/cn.js";
import { formatNumber } from "../../utils/format.js";

const axisTickStyle = { fill: "#94A3B8", fontSize: 11 };

export default function LowStockChart({
  data,
  title = "Low Stock Products",
  subtitle = "Items at or below their reorder point",
  className,
}) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </div>

      <div className="mt-4 h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              tick={axisTickStyle}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tickFormatter={(value) => formatNumber(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={132}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="stock" name="In stock" fill="#F59E0B" radius={[0, 6, 6, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
