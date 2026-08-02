import { getGradient, getInitials } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const sizes = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export default function Avatar({ name = "", size = "md", seed, className }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white",
        getGradient(seed ?? name),
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
