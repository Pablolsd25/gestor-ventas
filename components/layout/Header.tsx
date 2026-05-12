"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/":              "Dashboard",
  "/clientes":      "Clientes",
  "/ventas":        "Ventas",
  "/recordatorios": "Recordatorios",
  "/resultados":    "Resultados",
};

export default function Header() {
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
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 capitalize">{today}</span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          V
        </div>
      </div>
    </header>
  );
}
