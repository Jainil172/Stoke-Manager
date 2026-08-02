import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import api from "../../services/api.js";
import { showToast } from "../common/Toast.jsx";
import { validateEmail } from "../../utils/validators.js";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextError = validateEmail(email);
    setError(nextError);
    if (nextError) return;

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      showToast.success("Reset link sent to your inbox");
    } catch (err) {
      showToast.error(
        err.response?.data?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-card border border-white/10 bg-white/[0.04] p-6 text-center shadow-soft backdrop-blur-xl sm:p-8">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
          <FiCheckCircle size={30} />
        </span>
        <h1 className="mt-6 text-xl font-bold text-white">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-semibold text-white">{email}</span>. The link expires in 30
          minutes.
        </p>
        <Button variant="secondary" className="mt-7 w-full" onClick={() => setSent(false)}>
          Resend email
        </Button>
        <Link
          to="/login"
          className="mt-4 block text-sm font-medium text-secondary transition-colors hover:text-white"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-white/10 bg-white/[0.04] p-6 shadow-soft backdrop-blur-xl sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-white">Reset your password</h1>
      <p className="mt-1.5 text-sm text-muted">
        Enter your account email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input
          floating
          label="Email address"
          type="email"
          icon={FiMail}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          error={error}
          autoComplete="email"
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Send Reset Link
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-muted transition-colors hover:text-white"
      >
        <FiArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}
