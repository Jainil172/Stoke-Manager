import { landingFeatures } from "../../../constants/landingContent.js";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import FeatureCard from "../../../components/cards/FeatureCard.jsx";

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything your inventory needs, in one place"
          description="From receiving stock to forecasting demand — StockFlow gives your team the tools to run operations like a well-oiled machine."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {landingFeatures.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
