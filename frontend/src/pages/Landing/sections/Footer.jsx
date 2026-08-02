import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiTwitter,
} from "react-icons/fi";
import { footerLinks } from "../../../constants/landingContent.js";
import { Logo } from "../../../components/common/Logo.jsx";

const socials = [
  { icon: FiTwitter, label: "Twitter" },
  { icon: FiGithub, label: "GitHub" },
  { icon: FiLinkedin, label: "LinkedIn" },
  { icon: FiInstagram, label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              The modern inventory management platform for growing teams. Track stock, suppliers,
              and reports in one beautiful workspace.
            </p>
            <div className="mt-6 flex gap-2.5">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href="#home"
                    onClick={(event) => event.preventDefault()}
                    aria-label={social.label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-white"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold tracking-wide text-white uppercase">
                {title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#home"
                      onClick={(event) => event.preventDefault()}
                      className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-white"
                    >
                      {link}
                      <FiArrowUpRight
                        size={12}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} StockFlow Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted">
            <Link to="/login" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link to="/login" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link to="/login" className="transition-colors hover:text-white">
              Security
            </Link>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
