import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiEdit2, FiMail, FiMapPin } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Input from "../../components/ui/Input.jsx";
import Textarea from "../../components/ui/Textarea.jsx";
import Button from "../../components/ui/Button.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { showToast } from "../../components/common/Toast.jsx";
import { extractApiError } from "../../services/apiMapper.js";
import { validateEmail, validateRequired } from "../../utils/validators.js";
import { formatDate } from "../../utils/format.js";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { products, suppliers } = useData();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "+91 98765 43210",
    location: user?.location ?? "Mumbai, India",
    bio: user?.bio ?? "Keeping the warehouse running smoothly.",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/auth/profile")
      .then(({ data }) => {
        if (cancelled) return;
        updateUser(data.user);
        setForm({
          name: data.user.name ?? "",
          email: data.user.email ?? "",
          phone: data.user.phone ?? "+91 98765 43210",
          location: data.user.location ?? "Mumbai, India",
          bio: data.user.bio ?? "Keeping the warehouse running smoothly.",
        });
      })
      .catch(() => {
        if (!cancelled) showToast.error("Could not load your profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [updateUser]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const tenure = useMemo(() => {
    const joinedAt = new Date(user?.created_at ?? Date.now());
    if (Number.isNaN(joinedAt.getTime())) return "New member";
    const months = Math.max(
      0,
      Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    );
    if (months >= 24) return `${Math.floor(months / 12)} yrs`;
    if (months >= 12) return "1 yr";
    if (months >= 1) return `${months} mo`;
    return "New";
  }, [user?.created_at]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      name: validateRequired(form.name, "Full name"),
      email: validateEmail(form.email),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const { data: response } = await api.put("/auth/profile", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
      });
      updateUser(response.user);
      showToast.success("Profile updated");
    } catch (error) {
      showToast.error(extractApiError(error, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your account details and activity" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit text-center lg:col-span-1">
          <Avatar name={user?.name ?? "Admin"} size="lg" className="mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-white">{user?.name}</h3>
          <p className="text-sm text-muted">{user?.email}</p>
          <div className="mt-3 flex justify-center">
            <Badge variant="primary" dot>Administrator</Badge>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">{form.bio}</p>

          <div className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-5 text-left text-sm">
            <p className="flex items-center gap-2.5 text-muted">
              <FiMail size={14} className="shrink-0 text-secondary" />
              {user?.email}
            </p>
            <p className="flex items-center gap-2.5 text-muted">
              <FiMapPin size={14} className="shrink-0 text-secondary" />
              {form.location}
            </p>
            <p className="flex items-center gap-2.5 text-muted">
              <FiCalendar size={14} className="shrink-0 text-secondary" />
              Joined {user?.created_at ? formatDate(user.created_at) : user?.joinedAt ?? "March 2025"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-5">
            {[
              { value: products.length.toLocaleString(), label: "Products" },
              { value: suppliers.length.toLocaleString(), label: "Suppliers" },
              { value: tenure, label: "Active" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/[0.03] py-3">
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Edit Profile</h3>
              <p className="mt-0.5 text-xs text-muted">Keep your information up to date</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-secondary">
              <FiEdit2 size={17} />
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Full name"
                value={form.name}
                onChange={handleChange("name")}
                error={errors.name}
              />
              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                error={errors.email}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Phone"
                value={form.phone}
                onChange={handleChange("phone")}
              />
              <Input
                label="Location"
                value={form.location}
                onChange={handleChange("location")}
              />
            </div>
            <Textarea
              label="Bio"
              rows={4}
              value={form.bio}
              onChange={handleChange("bio")}
            />
            <div className="flex justify-end border-t border-white/[0.06] pt-4">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
