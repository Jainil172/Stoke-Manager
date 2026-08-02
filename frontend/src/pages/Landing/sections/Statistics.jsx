import { motion } from "framer-motion";
import { landingStats } from "../../../constants/landingContent.js";
import Counter from "../../../components/common/Counter.jsx";

export default function Statistics() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative overflow-hidden rounded-card border border-white/[0.08] bg-gradient-to-br from-card via-card to-primary/15 px-6 py-12 sm:px-12 sm:py-16"
        >
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
            aria-hidden="true"
          />
          <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {landingStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                className="text-center"
              >
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  compact={stat.compact}
                  decimals={stat.decimals ?? 0}
                  className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-extrabold text-transparent sm:text-[2.75rem]"
                />
                <p className="mt-2.5 text-sm font-medium text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
