"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/SmoothScroll";
import Dock from "@/components/Dock";
import LiquidBackground from "@/components/LiquidBackground";

type SiteTheme = "light" | "dark";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [theme, setTheme] = useState<SiteTheme>(() => {
    if (typeof window === "undefined") return "dark";
    const storedTheme = localStorage.getItem("site-theme") as SiteTheme | null;
    if (storedTheme) return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (!isAdmin) return;
    document.documentElement.removeAttribute("data-site-theme");
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    document.documentElement.setAttribute("data-site-theme", theme);
    localStorage.setItem("site-theme", theme);
  }, [theme, isAdmin]);

  return (
    <>
      {!isAdmin && <LiquidBackground />}

      {!isAdmin && (
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          className="site-theme-toggle"
          aria-label={theme === "light" ? "Activar tema oscuro" : "Activar tema claro"}
          title={theme === "light" ? "Cambiar a oscuro" : "Cambiar a claro"}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      )}

      <SmoothScroll>
        <div className={isAdmin ? "" : "site-neuro"}>{children}</div>
        {!isAdmin && <Dock />}
      </SmoothScroll>
    </>
  );
}
