import {
  FiLayout,
  FiPackage,
  FiGrid,
  FiTruck,
  FiArchive,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiArrowDownCircle,
  FiArrowUpCircle,
} from "react-icons/fi";

export const sidebarSections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: FiLayout },
      { label: "Products", path: "/dashboard/products", icon: FiPackage },
      { label: "Categories", path: "/dashboard/categories", icon: FiGrid },
      { label: "Suppliers", path: "/dashboard/suppliers", icon: FiTruck },
      { label: "Inventory", path: "/dashboard/inventory", icon: FiArchive },
      { label: "Stock In", path: "/dashboard/stock-in", icon: FiArrowDownCircle },
      { label: "Stock Out", path: "/dashboard/stock-out", icon: FiArrowUpCircle },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Reports", path: "/dashboard/reports", icon: FiBarChart2 },
      { label: "Settings", path: "/dashboard/settings", icon: FiSettings },
      { label: "Profile", path: "/dashboard/profile", icon: FiUser },
    ],
  },
];

export const pageLabels = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  suppliers: "Suppliers",
  inventory: "Inventory",
  "stock-in": "Stock In",
  "stock-out": "Stock Out",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
};
