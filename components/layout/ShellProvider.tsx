"use client";

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

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
