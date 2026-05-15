"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/":              "Dashboard",
  "/clientes":      "Clientes",
  "/ventas":        "Ventas",
  "/recordatorios": "Recordatorios",
  "/resultados":    "Resultados",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    (pathname.startsWith("/clientes") ? "Clientes" : "GestorVentas");

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa — sólo visible en mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900 p-1 -ml-1 rounded"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {/* Fecha — oculta en pantallas pequeñas */}
        <span className="hidden sm:block text-sm text-gray-500 capitalize">{today}</span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          V
        </div>
      </div>
    </header>
  );
}
