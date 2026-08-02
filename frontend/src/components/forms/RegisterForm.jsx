import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { showToast } from "../common/Toast.jsx";
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRequired,
} from "../../utils/validators.js";
import { cn } from "../../utils/cn.js";

const strengthColors = ["bg-danger", "bg-danger", "bg-warning", "bg-success", "bg-success"];

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(values.password);

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      name: validateRequired(values.name, "Full name"),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: validateConfirmPassword(values.confirmPassword, values.password),
      terms: values.terms ? null : "You must accept the terms to continue.",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      showToast.success("Account created — please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ?? "Unable to create your account. Please try again.";
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted">Start your 14-day free trial — no card required.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input
          floating
          label="Full name"
          icon={FiUser}
          value={values.name}
          onChange={handleChange("name")}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          floating
          label="Email address"
          type="email"
          icon={FiMail}
          value={values.email}
          onChange={handleChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <div>
          <Input
            floating
            label="Password"
            type="password"
            icon={FiLock}
            value={values.password}
            onChange={handleChange("password")}
            error={errors.password}
            autoComplete="new-password"
          />
          {values.password && (
            <div className="mt-2.5">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((segment) => (
                  <span
                    key={segment}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-300",
                      segment <= strength ? strengthColors[strength] : "bg-white/10"
                    )}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Password strength:{" "}
                <span
                  className={cn(
                    "font-semibold",
                    strength <= 1 && "text-danger",
                    strength >= 2 && strength <= 3 && "text-warning",
                    strength === 4 && "text-success"
                  )}
                >
                  {getPasswordStrengthLabel(strength)}
                </span>
              </p>
            </div>
          )}
        </div>
        <Input
          floating
          label="Confirm password"
          type="password"
          icon={FiLock}
          value={values.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.terms}
              onChange={handleChange("terms")}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[#2563EB]"
            />
            <span>
              I agree to the{" "}
              <span className="font-medium text-secondary">Terms of Service</span> and{" "}
              <span className="font-medium text-secondary">Privacy Policy</span>.
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs font-medium text-danger">{errors.terms}</p>}
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create Account
          {!loading && <FiArrowRight size={17} />}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-secondary transition-colors hover:text-white"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-center text-xs text-secondary">
        Your account is stored securely — passwords are hashed before saving.
      </p>
    </div>
  );
}
