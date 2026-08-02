import {
  FiCpu,
  FiDatabase,
  FiHeadphones,
  FiMonitor,
  FiMousePointer,
  FiShoppingBag,
  FiWifi,
  FiZap,
} from "react-icons/fi";

export const categoryIconMap = {
  cpu: FiCpu,
  bag: FiShoppingBag,
  headphones: FiHeadphones,
  database: FiDatabase,
  mouse: FiMousePointer,
  monitor: FiMonitor,
  wifi: FiWifi,
  zap: FiZap,
};

export const categoryIconKeys = Object.keys(categoryIconMap);

export const categoryColorPresets = [
  { gradient: "from-blue-500 to-indigo-600", hex: "#2563EB" },
  { gradient: "from-violet-500 to-purple-600", hex: "#8B5CF6" },
  { gradient: "from-emerald-500 to-teal-600", hex: "#10B981" },
  { gradient: "from-amber-500 to-orange-600", hex: "#F59E0B" },
  { gradient: "from-rose-500 to-pink-600", hex: "#F43F5E" },
  { gradient: "from-cyan-500 to-sky-600", hex: "#06B6D4" },
  { gradient: "from-fuchsia-500 to-purple-600", hex: "#D946EF" },
  { gradient: "from-orange-400 to-red-500", hex: "#F97316" },
];
