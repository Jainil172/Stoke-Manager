import { FiMoreVertical } from "react-icons/fi";
import Dropdown from "../ui/Dropdown.jsx";
import { cn } from "../../utils/cn.js";

export default function ActionMenu({ items = [], align = "right", className }) {
  if (!items.length) return null;

  return (
    <div className={cn("inline-flex", className)}>
      <Dropdown
        align={align}
        width="w-44"
        trigger={
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Row actions"
          >
            <FiMoreVertical size={16} />
          </span>
        }
        items={items}
      />
    </div>
  );
}
