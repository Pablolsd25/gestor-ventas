"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ThemeProvider from "./ThemeProvider";

/**
 * Renderiza el Sidebar + Header sólo cuando NO se está en páginas de auth.
 * Así la página /login aparece limpia, sin la shell del dashboard.
 */
export default function ShellProvider({
  children,
  nombre,
  puesto,
  fotoUrl,
}: {
  children: React.ReactNode;
  nombre: string;
  puesto: string;
  fotoUrl: string | null;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider>
      <div className="h-full flex bg-gray-50 dark:bg-slate-900">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          nombre={nombre}
          puesto={puesto}
          fotoUrl={fotoUrl}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-auto min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} nombre={nombre} fotoUrl={fotoUrl} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
