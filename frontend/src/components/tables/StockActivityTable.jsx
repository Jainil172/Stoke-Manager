import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiRefreshCw,
  FiRotateCcw,
} from "react-icons/fi";
import Card from "../common/Card.jsx";
import Avatar from "../ui/Avatar.jsx";
import Badge from "../ui/Badge.jsx";
import { getActivityBadge, timeAgo } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const activityIcons = {
  "stock-in": { icon: FiArrowDownLeft, color: "text-success" },
  "stock-out": { icon: FiArrowUpRight, color: "text-danger" },
  adjustment: { icon: FiRefreshCw, color: "text-warning" },
  return: { icon: FiRotateCcw, color: "text-secondary" },
};

export default function StockActivityTable({ data = [] }) {
  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Recent Stock Activities</h3>
        <p className="mt-0.5 text-xs text-muted">Latest movements across your warehouse</p>
      </div>

      <div className="space-y-1">
        {data.map((activity) => {
          const meta = getActivityBadge(activity.type);
          const iconMeta = activityIcons[activity.type] ?? activityIcons.adjustment;
          const Icon = iconMeta.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-xl p-2.5 transition-colors duration-150 hover:bg-white/[0.03]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04]">
                <Icon size={16} className={iconMeta.color} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{activity.product}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{activity.note}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={meta.variant}>{meta.label}</Badge>
                <div className="flex items-center gap-2 text-[11px] text-white/40">
                  <Avatar name={activity.user} size="xs" />
                  <span className="hidden sm:inline">{activity.user}</span>
                  <span>{timeAgo(activity.time)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
