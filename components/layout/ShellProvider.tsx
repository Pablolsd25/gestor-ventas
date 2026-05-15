"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * Renderiza el Sidebar + Header sólo cuando NO se está en páginas de auth.
 * Así la página /login aparece limpia, sin la shell del dashboard.
 */
export default function ShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-auto min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
