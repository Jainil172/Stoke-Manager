import { motion } from "framer-motion";
import Card from "../common/Card.jsx";
import { cn } from "../../utils/cn.js";

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Card hover className="h-full">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-secondary">
          <Icon size={22} />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </Card>
    </motion.div>
  );
}
