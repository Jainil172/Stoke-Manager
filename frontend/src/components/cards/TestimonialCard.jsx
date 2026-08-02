import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import Card from "../common/Card.jsx";
import Avatar from "../ui/Avatar.jsx";

export default function TestimonialCard({ quote, name, role, initials, color, rating }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card hover className="flex h-full flex-col">
        <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: rating }).map((_, index) => (
            <FiStar key={index} size={15} className="fill-warning text-warning" />
          ))}
        </div>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-white/80">"{quote}"</p>
        <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
          <Avatar name={name} seed={initials} />
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-muted">{role}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
