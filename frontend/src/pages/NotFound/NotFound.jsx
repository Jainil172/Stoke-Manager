import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiHome, FiPackage } from "react-icons/fi";
import Button from "../../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 text-center">
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <motion.span
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-glow"
        >
          <FiPackage size={36} className="text-white" />
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl"
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="mt-4 text-2xl font-bold text-white sm:text-3xl"
      >
        Page not found
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.26 }}
        className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base"
      >
        The page you're looking for doesn't exist or has been moved. Let's get you back on
        track.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.34 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <Link to="/">
          <Button variant="secondary" size="lg" leftIcon={FiArrowLeft} className="w-full sm:w-auto">
            Back to Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button size="lg" leftIcon={FiHome} className="w-full sm:w-auto">
            Go to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
