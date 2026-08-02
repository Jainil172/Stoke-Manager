import { testimonials } from "../../../constants/landingContent.js";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import TestimonialCard from "../../../components/cards/TestimonialCard.jsx";

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by operations teams everywhere"
          description="From two-person startups to 500-warehouse enterprises — here's what teams say after switching to StockFlow."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
