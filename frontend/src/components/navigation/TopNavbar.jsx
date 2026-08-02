import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiChevronDown,
  FiInfo,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiPackage,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useClickOutside } from "../../hooks/useClickOutside.js";
import Dropdown from "../ui/Dropdown.jsx";
import Avatar from "../ui/Avatar.jsx";
import Badge from "../ui/Badge.jsx";
import { getStatusBadge, timeAgo } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const notificationStyles = {
  warning: { icon: FiAlertTriangle, iconClass: "bg-warning/10 text-warning" },
  success: { icon: FiCheckCircle, iconClass: "bg-success/10 text-success" },
  danger: { icon: FiAlertTriangle, iconClass: "bg-danger/10 text-danger" },
  info: { icon: FiInfo, iconClass: "bg-primary/10 text-secondary" },
};

const buildNotifications = (products) =>
  products
    .filter((product) => product.status === "low-stock" || product.status === "out-of-stock")
    .map((product) =>
      product.status === "out-of-stock"
        ? {
            id: `out-${product.id}`,
            type: "danger",
            title: `${product.name} is out of stock`,
            description: `SKU ${product.sku} has 0 units available. Restock to avoid lost sales.`,
            time: product.updatedAt,
          }
        : {
            id: `low-${product.id}`,
            type: "warning",
            title: `${product.name} is running low`,
            description: `SKU ${product.sku} has ${product.stock} units left — below its reorder point.`,
            time: product.updatedAt,
          }
    )
    .slice(0, 8);

export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { products } = useData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [readIds, setReadIds] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const searchRef = useClickOutside(() => setQuery(""));

  const notifications = useMemo(() => {
    const items = buildNotifications(products);
    return items.map((notification) => ({
      ...notification,
      read: readIds.has(notification.id),
    }));
  }, [products, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    return products
      .filter((product) => product.name.toLowerCase().includes(trimmed.toLowerCase()))
      .slice(0, 5);
  }, [query]);

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const notificationItems = [
    ...(notifications.length > 0
      ? notifications.map((notification) => {
          const style = notificationStyles[notification.type] ?? notificationStyles.info;
          const Icon = style.icon;
          return {
            key: `notification-${notification.id}`,
            render: () => (
              <div className="flex w-full items-start gap-3 p-2">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    style.iconClass
                  )}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center justify-between gap-2 text-sm font-medium text-white">
                    {notification.title}
                    {!notification.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                    {notification.description}
                  </p>
                  <p className="mt-1 text-[11px] text-white/35">{timeAgo(notification.time)}</p>
                </div>
              </div>
            ),
          };
        })
      : [
          {
            key: "empty",
            render: () => (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-success/10 text-success">
                  <FiCheckCircle size={20} />
                </span>
                <p className="text-sm font-medium text-white">You're all caught up</p>
                <p className="text-xs text-muted">No low-stock or out-of-stock alerts right now.</p>
              </div>
            ),
          },
        ]),
    {
      key: "mark-all",
      divider: true,
      render: () => (
        <span
          role="button"
          tabIndex={0}
          onClick={markAllRead}
          className="w-full py-1 text-center text-xs font-semibold text-secondary hover:text-white"
        >
          Mark all as read
        </span>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition-colors hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <FiMenu size={19} />
        </button>

        <div ref={searchRef} className="relative hidden max-w-md flex-1 md:block">
          <FiSearch size={17} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pr-4 pl-11 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 hover:border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-12 z-50 w-full overflow-hidden rounded-2xl border border-white/10 bg-card p-1.5 shadow-soft"
              >
                {results.map((product) => {
                  const status = getStatusBadge(product.status);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setQuery("");
                        navigate(`/dashboard/products/${product.id}`);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white",
                          product.color
                        )}
                      >
                        <FiPackage size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {product.name}
                        </span>
                        <span className="block text-xs text-muted">
                          {product.sku} · {product.category}
                        </span>
                      </span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition-all duration-300 hover:text-white"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <Dropdown
            trigger={
              <button
                type="button"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition-colors hover:text-white"
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            }
            items={notificationItems}
            width="w-80 sm:w-96"
          />

          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pr-3 pl-1.5 transition-colors hover:bg-white/[0.06]"
              >
                <Avatar name={user?.name ?? "Admin"} size="sm" />
                <span className="hidden text-left sm:block">
                  <span className="block text-sm leading-tight font-semibold text-white">
                    {user?.name ?? "Admin"}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted">
                    {user?.role ?? "Administrator"}
                  </span>
                </span>
                <FiChevronDown size={15} className="hidden text-muted sm:inline" />
              </button>
            }
            items={[
              {
                key: "profile",
                label: "Profile",
                icon: FiUser,
                onClick: () => navigate("/dashboard/profile"),
              },
              {
                key: "settings",
                label: "Settings",
                icon: FiSettings,
                onClick: () => navigate("/dashboard/settings"),
              },
              { key: "divider", divider: true },
              {
                key: "logout",
                label: "Logout",
                icon: FiLogOut,
                danger: true,
                onClick: handleLogout,
              },
            ]}
            width="w-52"
          />
        </div>
      </div>
    </header>
  );
}
