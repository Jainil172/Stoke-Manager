import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import PricingCard from "../../../components/cards/PricingCard.jsx";
import { pricingPlans } from "../../../constants/landingContent.js";
import { showToast } from "../../../components/common/Toast.jsx";
import { cn } from "../../../utils/cn.js";

export default function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(true);

  const handleSelect = (plan) => {
    if (plan.name === "Enterprise") {
      showToast.info("Sales will reach out — thanks for your interest!");
      return;
    }
    showToast.success(`Starting ${plan.name} trial — creating your account...`);
    navigate("/register");
  };

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing that scales with you"
          description="Start free for 14 days. Upgrade when you're ready — cancel or change plans anytime."
        />

        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={cn("text-sm font-medium", !yearly ? "text-white" : "text-muted")}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly((prev) => !prev)}
            className="relative h-7 w-[52px] rounded-full bg-primary p-1 transition-colors"
            aria-label="Toggle yearly billing"
          >
            <span
              className={cn(
                "block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                yearly && "translate-x-[22px]"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium", yearly ? "text-white" : "text-muted")}>
            Yearly
            <span className="ml-2 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              Save 20%
            </span>
          </span>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              yearly={yearly}
              onSelect={handleSelect}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
