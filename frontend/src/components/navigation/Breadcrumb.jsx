import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";
import { pageLabels } from "../../constants/navItems.js";
import { useData } from "../../context/DataContext.jsx";

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const { products } = useData();
  const segments = pathname.split("/").filter(Boolean);

  const labelFor = (segment, index) => {
    if (pageLabels[segment]) return pageLabels[segment];
    if (/^\d+$/.test(segment) && segments[index - 1] === "products") {
      const product = products.find((item) => String(item.id) === segment);
      if (product) return product.name;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm">
      <Link
        to="/dashboard"
        className="flex items-center gap-1.5 font-medium text-muted transition-colors hover:text-white"
      >
        <FiHome size={14} />
        Home
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const label = labelFor(segment, index);
        return (
          <Fragment key={path}>
            <FiChevronRight size={14} className="text-white/20" />
            {isLast ? (
              <span className="max-w-56 truncate font-semibold text-white">{label}</span>
            ) : (
              <Link to={path} className="font-medium text-muted transition-colors hover:text-white">
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
