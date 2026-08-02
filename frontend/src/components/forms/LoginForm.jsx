import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiGithub, FiLock, FiMail } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa6";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { showToast } from "../common/Toast.jsx";
import { validateEmail, validatePassword } from "../../utils/validators.js";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from ?? "/dashboard";

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      showToast.success(`Welcome back, ${values.email.split("@")[0]}!`);
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ?? "Unable to sign in. Please try again.";
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted">Sign in to your StockFlow workspace.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
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
        <Input
          floating
          label="Password"
          type="password"
          icon={FiLock}
          value={values.password}
          onChange={handleChange("password")}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5 text-muted">
            <input
              type="checkbox"
              checked={values.remember}
              onChange={handleChange("remember")}
              className="h-4 w-4 cursor-pointer rounded accent-[#2563EB]"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-medium text-secondary transition-colors hover:text-white"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign In
          {!loading && <FiArrowRight size={17} />}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs text-muted">or continue with</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => showToast.info("Social sign-in is disabled in this demo")}
        >
          <FaGoogle size={16} className="text-[#EA4335]" />
          Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => showToast.info("Social sign-in is disabled in this demo")}
        >
          <FiGithub size={16} />
          GitHub
        </Button>
      </div>

      <p className="mt-7 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-secondary transition-colors hover:text-white"
        >
          Create one
        </Link>
      </p>
      <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-center text-xs text-secondary">
        New here? Sign up in seconds — no credit card required.
      </p>
    </div>
  );
}
