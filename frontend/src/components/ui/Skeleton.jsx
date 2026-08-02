import { cn } from "../../utils/cn.js";

export default function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-white/[0.06]", className)} />;
}

export function SkeletonRows({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className={cn("h-4", colIndex === 0 ? "w-1/3" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}
