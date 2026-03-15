import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";

// Fuente principal premium (Inter es una excelente opción corporativa e impactante)
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Portfolio | Senior Full-Stack Developer",
  description: "Portafolio interactivo de alto impacto visual con diseño dinámico. Headless CMS Edition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className={`${inter.className} bg-black text-white selection:bg-white selection:text-black`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
