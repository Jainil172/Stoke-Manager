import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { useClickOutside } from "../../hooks/useClickOutside.js";
import { cn } from "../../utils/cn.js";

export default function Dropdown({
  trigger,
  items = [],
  align = "right",
  width = "w-56",
  header = null,
  className,
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-2 origin-top rounded-2xl border border-white/10 bg-card p-1.5 shadow-soft",
              align === "right" ? "right-0" : "left-0",
              width
            )}
          >
            {header && (
              <div className="mb-1 border-b border-white/[0.06] px-3 pt-1.5 pb-2.5">
                {header}
              </div>
            )}
            {items.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.key ?? `${item.label}-${index}`}>
                  {item.divider && <div className="my-1.5 border-t border-white/[0.06]" />}
                  <button
                    type="button"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      item.danger
                        ? "text-danger hover:bg-danger/10"
                        : "text-muted hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {item.render ? (
                      item.render()
                    ) : (
                      <>
                        {ItemIcon && <ItemIcon size={16} className="shrink-0" />}
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && <span className="text-xs text-white/40">{item.badge}</span>}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownTrigger({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-xl transition-colors",
        className
      )}
    >
      {children}
      <FiChevronDown size={16} className="text-muted" />
    </span>
  );
}
