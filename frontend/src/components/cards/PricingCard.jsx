import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Card from "../common/Card.jsx";
import Button from "../ui/Button.jsx";
import { cn } from "../../utils/cn.js";

export default function PricingCard({
  plan,
  yearly,
  onSelect,
  index = 0,
}) {
  const { name, monthly, description, features, cta, popular } = plan;
  const price = monthly === null ? null : yearly ? Math.round(monthly * 0.8) : monthly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative flex h-full flex-col p-6 sm:p-7",
          popular && "border-primary/40 shadow-glow"
        )}
      >
        {popular && (
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-glow">
            Most Popular
          </span>
        )}
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <p className="mt-1.5 min-h-10 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-6 flex items-baseline gap-1.5">
          {price === null ? (
            <span className="text-4xl font-bold tracking-tight text-white">Custom</span>
          ) : (
            <>
              <span className="text-4xl font-bold tracking-tight text-white">₹{price}</span>
              <span className="text-sm text-muted">/month</span>
            </>
          )}
        </div>
        {monthly !== null && (
          <p className="mt-1.5 text-xs text-muted">
            {yearly ? "billed annually" : "billed monthly"} · {yearly ? "save 20%" : "14-day free trial"}
          </p>
        )}
        <ul className="mt-7 flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-white/85">
              <span
                className={cn(
                  "mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full",
                  popular ? "bg-primary/20 text-secondary" : "bg-success/10 text-success"
                )}
              >
                <FiCheck size={11} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <Button
          variant={popular ? "primary" : "secondary"}
          className="mt-8 w-full"
          onClick={() => onSelect(plan)}
        >
          {cta}
        </Button>
      </Card>
    </motion.div>
  );
}
