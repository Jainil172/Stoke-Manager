import {
  FiBox,
  FiTruck,
  FiBarChart2,
  FiZap,
  FiShield,
  FiLink,
} from "react-icons/fi";

export const landingNavLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export const landingFeatures = [
  { icon: FiBox, title: "Real-Time Inventory Tracking", description: "Every unit tracked from purchase to shelf. Live stock levels, low-stock alerts, and automatic reorder points." },
  { icon: FiTruck, title: "Supplier Management", description: "Manage vendors, lead times, and purchase orders in one place. Never lose track of who supplies what." },
  { icon: FiBarChart2, title: "Reports & Analytics", description: "Understand sell-through rates, revenue trends, and category performance with beautiful, exportable reports." },
  { icon: FiZap, title: "Instant Alerts", description: "Get notified the moment stock runs low, orders are delayed, or a price changes on a key item." },
  { icon: FiShield, title: "Role-Based Access", description: "Invite your team with granular permissions. Everyone sees exactly what they need — nothing more." },
  { icon: FiLink, title: "Seamless Integrations", description: "Connect Shopify, Stripe, QuickBooks, and 40+ tools. Your inventory stays in sync everywhere." },
];

export const landingStats = [
  { value: 12000, suffix: "+", label: "Teams on StockFlow" },
  { value: 2400000, suffix: "", label: "Products tracked", compact: true },
  { value: 99.9, suffix: "%", label: "Uptime guaranteed", decimals: 1 },
  { value: 4.9, suffix: "/5", label: "Average rating", decimals: 1 },
];

export const pricingPlans = [
  {
    name: "Starter",
    monthly: 29,
    description: "For small teams getting started with inventory.",
    features: ["Up to 500 SKUs", "1 warehouse", "Basic reports", "Email support", "CSV import"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    monthly: 79,
    description: "For growing businesses that need deeper insight.",
    features: ["Up to 5,000 SKUs", "Multi-warehouse", "Advanced analytics", "Priority support", "API access", "Custom alerts"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    description: "For large operations with complex requirements.",
    features: ["Unlimited SKUs", "Custom integrations", "Dedicated success manager", "SSO & advanced security", "SLA support"],
    cta: "Contact Sales",
    popular: false,
  },
];

export const testimonials = [
  {
    quote: "StockFlow replaced three spreadsheets and a shared doc. Our inventory is finally under control — and I actually enjoy checking the dashboard.",
    name: "Maya Patel",
    role: "COO, Northwind Goods",
    initials: "MP",
    color: "from-blue-500 to-indigo-600",
    rating: 5,
  },
  {
    quote: "The reports alone are worth it. We cut stockouts by 40% in the first quarter and finally stopped over-ordering slow movers.",
    name: "Daniel Kim",
    role: "Founder, Loop Supply",
    initials: "DK",
    color: "from-emerald-500 to-teal-600",
    rating: 5,
  },
  {
    quote: "Setup took an afternoon, and my team actually enjoys using it — that never happens with inventory software. The UI is genuinely beautiful.",
    name: "Sarah Okafor",
    role: "Operations Lead, Brightline Retail",
    initials: "SO",
    color: "from-amber-500 to-orange-600",
    rating: 5,
  },
];

export const faqs = [
  { question: "Is there a free trial?", answer: "Yes — every plan starts with a 14-day free trial. No credit card required, and you can invite your whole team right away." },
  { question: "Can I migrate from spreadsheets?", answer: "Absolutely. Import your existing catalog with our CSV importer, and we'll map your columns automatically. Most teams migrate in under an hour." },
  { question: "Does it support multiple warehouses?", answer: "Yes. The Pro plan supports unlimited warehouses with per-location stock levels, transfer orders, and location-based reorder points." },
  { question: "How secure is my data?", answer: "Your data is encrypted in transit and at rest, backed up continuously, and hosted on SOC 2 compliant infrastructure. Enterprise plans include SSO." },
  { question: "Can I cancel anytime?", answer: "You can cancel or downgrade anytime with a single click. Unused time is refunded prorated, and your data is exportable for 30 days." },
  { question: "Do you offer support?", answer: "Starter plans include email support. Pro includes priority support and Enterprise gets a dedicated success manager with 24/7 chat." },
];

export const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
  Company: ["About", "Careers", "Blog", "Press Kit", "Contact"],
  Resources: ["Documentation", "API Reference", "Help Center", "Community", "Status"],
};
