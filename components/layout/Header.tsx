"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SearchModal from "@/components/layout/SearchModal";

// ── Breadcrumb helpers ────────────────────────────────────────────────────────

const TOP_TITLES: Record<string, string> = {
  "/":              "Dashboard",
  "/clientes":      "Clientes",
  "/ventas":        "Ventas",
  "/recordatorios": "Recordatorios",
  "/resultados":    "Resultados",
};

const SEGMENT_LABELS: Record<string, string> = {
  clientes:      "Clientes",
  ventas:        "Ventas",
  recordatorios: "Recordatorios",
  resultados:    "Resultados",
  nuevo:         "Nuevo",
  editar:        "Editar",
};

type Crumb = { label: string; href: string; isLast: boolean };

function buildBreadcrumbs(pathname: string): Crumb[] | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null; // top-level: no breadcrumb trail needed

  const crumbs: Crumb[] = [];
  let path = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    path += `/${seg}`;
    const isUUID = /^[0-9a-f-]{30,}$/i.test(seg);
    if (!isUUID) {
      crumbs.push({
        label:  SEGMENT_LABELS[seg] ?? seg,
        href:   path,
        isLast: i === segments.length - 1 || segments.slice(i + 1).every(s => /^[0-9a-f-]{30,}$/i.test(s)),
      });
    }
  }
  return crumbs.length > 1 ? crumbs : null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname   = usePathname();
  const topSection = "/" + (pathname.split("/")[1] ?? "");
  const title      = TOP_TITLES[topSection] ?? "GestorVentas";
  const breadcrumbs = buildBreadcrumbs(pathname);

  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    month:   "short",
    day:     "numeric",
  });

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 min-w-0">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-800 p-1.5 -ml-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title / Breadcrumbs */}
        {breadcrumbs ? (
          <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
            <Link
              href={topSection}
              className="text-gray-400 hover:text-gray-700 font-medium transition-colors shrink-0"
            >
              {title}
            </Link>
            {breadcrumbs.slice(1).map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {crumb.isLast ? (
                  <span className="font-semibold text-gray-800 truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-gray-400 hover:text-gray-700 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Search bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 w-56 md:w-72 lg:w-80 text-sm text-gray-400 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 px-3.5 py-2 rounded-xl transition-all text-left"
          aria-label="Buscar (⌘K)"
        >
          <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 truncate">Buscar clientes, ventas…</span>
          <kbd className="hidden md:inline-flex items-center text-[10px] font-mono border border-gray-200 rounded-md px-1.5 py-0.5 bg-white text-gray-400 shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Date — visible on sm+ */}
        <span className="hidden lg:block text-xs text-gray-400 capitalize pl-1">{today}</span>
        <div className="hidden lg:block w-px h-4 bg-gray-200" />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          V
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
