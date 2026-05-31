import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ShellProvider from "@/components/layout/ShellProvider";
import { ToastProvider } from "@/components/ui/toast";
import ToastFromUrl from "@/components/ui/ToastFromUrl";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { PerfilRow } from "@/types/database";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GestorVentas",
  description: "Panel de gestión para vendedores",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let perfil: PerfilRow | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("perfil").select("*").eq("id", 1).maybeSingle();
    perfil = (data ?? null) as PerfilRow | null;
  } catch {
    perfil = null;
  }

  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full">
        <ShellProvider
          nombre={perfil?.nombre ?? "Vendedor"}
          puesto={perfil?.puesto ?? "Panel del Vendedor"}
          fotoUrl={perfil?.foto_url ?? null}
        >
          <ToastProvider>
            <Suspense fallback={null}>
              <ToastFromUrl />
            </Suspense>
            {children}
          </ToastProvider>
        </ShellProvider>
      </body>
    </html>
  );
}
