import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ShellProvider from "@/components/layout/ShellProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GestorVentas",
  description: "Panel de gestión para vendedores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full">
        <ShellProvider>{children}</ShellProvider>
      </body>
    </html>
  );
}
