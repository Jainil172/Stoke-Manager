import { useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "../../utils/cn.js";

const baseClasses =
  "w-full rounded-xl border bg-white/[0.03] text-sm text-white outline-none transition-all duration-200 hover:bg-white/[0.05] focus:bg-white/[0.05]";

const stateClasses = {
  normal: "border-white/10 hover:border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20",
  error: "border-danger/60 focus:border-danger focus:ring-2 focus:ring-danger/20",
};

export default function Input({
  label,
  floating = false,
  type = "text",
  error,
  icon: Icon = null,
  className,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;
  const stateClass = error ? stateClasses.error : stateClasses.normal;

  return (
    <div className={className}>
      {label && !floating && (
        <label className="mb-2 block text-sm font-medium text-muted">{label}</label>
      )}
      <div className="relative">
        <input
          className={cn(
            baseClasses,
            floating && "peer",
            floating ? "px-4 pt-5 pb-2" : "px-4 py-3",
            Icon && "pl-11",
            isPassword && "pr-11",
            stateClass
          )}
          type={inputType}
          placeholder={floating ? " " : props.placeholder}
          {...props}
        />
        {Icon && (
          <Icon
            size={18}
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2",
              floating && "top-[30%]",
              error ? "text-danger" : "text-muted"
            )}
          />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-white"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
        {floating && (
          <label
            className={cn(
              "pointer-events-none absolute left-4 text-sm text-muted transition-all duration-200",
              floating && Icon && "left-11",
              "top-1/2 -translate-y-1/2",
              "peer-focus:top-2.5 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-secondary",
              "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
            )}
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger">
          <FiAlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
