"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/",              label: "Dashboard",      icon: "▦" },
  { href: "/clientes",      label: "Clientes",       icon: "👥" },
  { href: "/ventas",        label: "Ventas",          icon: "💼" },
  { href: "/recordatorios", label: "Recordatorios",  icon: "🔔" },
  { href: "/resultados",    label: "Resultados",      icon: "📊" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay backdrop — sólo en mobile cuando el menú está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white flex flex-col
          transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto lg:h-auto lg:min-h-screen
        `}
      >
        {/* Logo / Brand */}
        <div className="px-6 py-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">GestorVentas</h1>
            <p className="text-xs text-gray-400 mt-1">Panel del Vendedor</p>
          </div>
          {/* Botón cerrar — sólo visible en mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-6 py-4 border-t border-gray-700 text-xs text-gray-500">
          v1.0.0
        </div>
      </aside>
    </>
  );
}
