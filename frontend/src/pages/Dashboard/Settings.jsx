import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Toggle from "../../components/ui/Toggle.jsx";
import ConfirmationDialog from "../../components/common/ConfirmationDialog.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { showToast } from "../../components/common/Toast.jsx";
import { extractApiError } from "../../services/apiMapper.js";
import { validateEmail, validateRequired } from "../../utils/validators.js";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "+91 98765 43210",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    lowStock: true,
    weeklyDigest: true,
    orderUpdates: false,
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/auth/settings")
      .then(({ data }) => {
        if (cancelled) return;
        setPreferences({
          lowStock: Boolean(data.settings.low_stock_alerts),
          weeklyDigest: Boolean(data.settings.weekly_digest),
          orderUpdates: Boolean(data.settings.order_updates),
        });
      })
      .catch(() => {
        if (!cancelled) showToast.error("Could not load your preferences.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileChange = (field) => (event) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
    setProfileErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      name: validateRequired(profile.name, "Full name"),
      email: validateEmail(profile.email),
    };
    setProfileErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setProfileLoading(true);
    try {
      const { data: response } = await api.put("/auth/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
      updateUser(response.user);
      showToast.success("Profile updated");
    } catch (error) {
      showToast.error(extractApiError(error, "Could not update your profile."));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      current: validateRequired(password.current, "Current password"),
      next:
        password.next.length < 6
          ? "New password must be at least 6 characters."
          : validateRequired(password.next, "New password"),
      confirm:
        !password.confirm
          ? "Please confirm your new password."
          : password.confirm !== password.next
            ? "Passwords do not match."
            : null,
    };
    setPasswordErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setPasswordLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: password.current,
        newPassword: password.next,
      });
      setPassword({ current: "", next: "", confirm: "" });
      showToast.success("Password changed");
    } catch (error) {
      showToast.error(extractApiError(error, "Could not change your password."));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setPreferencesLoading(true);
    try {
      await api.put("/auth/settings", {
        lowStockAlerts: preferences.lowStock,
        weeklyDigest: preferences.weeklyDigest,
        orderUpdates: preferences.orderUpdates,
      });
      showToast.success("Notification preferences saved");
    } catch (error) {
      showToast.error(extractApiError(error, "Could not save preferences."));
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete("/auth/account");
      setDeleteOpen(false);
      logout();
      showToast.success("Account deleted");
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteOpen(false);
      showToast.error(extractApiError(error, "Could not delete the account."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your workspace preferences" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-white">Profile Information</h3>
          <p className="mt-0.5 text-xs text-muted">Update your personal details</p>
          <form onSubmit={handleProfileSubmit} noValidate className="mt-5 space-y-4">
            <Input
              label="Full name"
              icon={FiUser}
              value={profile.name}
              onChange={handleProfileChange("name")}
              error={profileErrors.name}
            />
            <Input
              label="Email address"
              type="email"
              icon={FiMail}
              value={profile.email}
              onChange={handleProfileChange("email")}
              error={profileErrors.email}
            />
            <Input
              label="Phone"
              icon={FiPhone}
              value={profile.phone}
              onChange={handleProfileChange("phone")}
            />
            <div className="flex justify-end border-t border-white/[0.06] pt-4">
              <Button type="submit" loading={profileLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-white">Change Password</h3>
          <p className="mt-0.5 text-xs text-muted">Use at least 6 characters</p>
          <form onSubmit={handlePasswordSubmit} noValidate className="mt-5 space-y-4">
            <Input
              label="Current password"
              type="password"
              icon={FiLock}
              value={password.current}
              onChange={(event) => {
                setPassword((prev) => ({ ...prev, current: event.target.value }));
                setPasswordErrors((prev) => ({ ...prev, current: null }));
              }}
              error={passwordErrors.current}
            />
            <Input
              label="New password"
              type="password"
              icon={FiLock}
              value={password.next}
              onChange={(event) => {
                setPassword((prev) => ({ ...prev, next: event.target.value }));
                setPasswordErrors((prev) => ({ ...prev, next: null }));
              }}
              error={passwordErrors.next}
            />
            <Input
              label="Confirm new password"
              type="password"
              icon={FiLock}
              value={password.confirm}
              onChange={(event) => {
                setPassword((prev) => ({ ...prev, confirm: event.target.value }));
                setPasswordErrors((prev) => ({ ...prev, confirm: null }));
              }}
              error={passwordErrors.confirm}
            />
            <div className="flex justify-end border-t border-white/[0.06] pt-4">
              <Button type="submit" loading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-white">Notifications</h3>
          <p className="mt-0.5 text-xs text-muted">Choose what we send you</p>
          <div className="mt-5 space-y-5">
            <Toggle
              label="Low stock alerts"
              description="Email me when a product drops below its reorder point"
              checked={preferences.lowStock}
              onChange={(checked) => setPreferences((prev) => ({ ...prev, lowStock: checked }))}
            />
            <Toggle
              label="Weekly digest"
              description="A summary of stock movement every Monday"
              checked={preferences.weeklyDigest}
              onChange={(checked) => setPreferences((prev) => ({ ...prev, weeklyDigest: checked }))}
            />
            <Toggle
              label="Order updates"
              description="Notifications for purchase order status changes"
              checked={preferences.orderUpdates}
              onChange={(checked) => setPreferences((prev) => ({ ...prev, orderUpdates: checked }))}
            />
          </div>
          <div className="flex justify-end border-t border-white/[0.06] pt-4">
            <Button
              variant="secondary"
              loading={preferencesLoading}
              onClick={handleSavePreferences}
            >
              Save Preferences
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-danger">Danger Zone</h3>
          <p className="mt-0.5 text-xs text-muted">Irreversible actions for your workspace</p>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-danger/20 bg-danger/[0.04] p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
                <FiAlertTriangle size={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Delete workspace</p>
                <p className="mt-0.5 text-xs text-muted">
                  This permanently removes all products, suppliers, and reports.
                </p>
              </div>
            </div>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete this workspace?"
        message="All products, categories, suppliers, and reports will be permanently removed. This cannot be undone."
        confirmLabel="Delete Workspace"
      />
    </div>
  );
}
