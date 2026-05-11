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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">GestorVentas</h1>
        <p className="text-xs text-gray-400 mt-1">Panel del Vendedor</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}
