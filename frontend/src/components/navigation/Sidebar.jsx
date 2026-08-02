import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { sidebarSections } from "../../constants/navItems.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ConfirmationDialog from "../common/ConfirmationDialog.jsx";
import { Logo } from "../common/Logo.jsx";
import { cn } from "../../utils/cn.js";

function SidebarContent({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = () => {
    setConfirmOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-white/30 uppercase">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-primary/10 text-white"
                        : "text-muted hover:bg-white/[0.05] hover:text-white"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                        />
                      )}
                      <item.icon
                        size={18}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive ? "text-secondary" : "text-muted group-hover:text-white"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <FiLogOut size={18} />
          Logout
        </button>
        <p className="mt-3 px-3 text-[11px] text-white/25">StockFlow v2.1.0 · Phase 3</p>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Sign out of StockFlow?"
        message="You'll need to sign in again to access your dashboard."
        confirmLabel="Sign Out"
      />
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
          >
            <SidebarContent onNavigate={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/[0.06] lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
