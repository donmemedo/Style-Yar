"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Camera, Moon, Sun, Languages, Menu, X, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Nav() {
  const { t, locale, setLocale, theme, toggleTheme } = useI18n();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 12);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => setOpen(false), [path]);

  const links: [string, string][] = [
    ["/", t("nav_home")], ["/search", t("nav_search")],
    ["/stylist", t("nav_stylist")], ["/sellers", t("nav_sellers")],
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${solid ? "glass shadow-lg shadow-black/5" : ""}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl grad-bg text-white">
            <Camera size={18} />
            <span className="pulse-ring absolute inset-0 rounded-xl border border-[var(--color-brand-300)]" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">{t("brand")}</span>
        </Link>

        <div className="mx-auto hidden items-center gap-1 md:flex">
          {links.map(([h, label]) => (
            <Link key={h} href={h}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors
                ${path === h ? "grad-text font-bold" : "muted hover:ink"}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <button onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
            aria-label={t("lang")} title={t("lang")}
            className="glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition hover:scale-105">
            <Languages size={15} />{locale === "fa" ? "EN" : "فا"}
          </button>
          <button onClick={toggleTheme} aria-label={t("theme")} title={t("theme")}
            className="glass grid h-9 w-9 place-items-center rounded-xl transition hover:scale-105">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/search" className="hidden sm:inline-flex">
            <span className="grad-bg inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white shadow-lg shadow-[var(--glow)] transition hover:scale-105">
              <Sparkles size={14} />{t("cta_scan")}
            </span>
          </Link>
          <button onClick={() => setOpen((v) => !v)} aria-label="menu"
            className="glass grid h-9 w-9 place-items-center rounded-xl md:hidden">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass md:hidden">
          <div className="flex flex-col p-3">
            {links.map(([h, label]) => (
              <Link key={h} href={h} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--glass)]">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
