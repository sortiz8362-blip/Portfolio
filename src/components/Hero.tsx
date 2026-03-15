"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import gsap from "gsap";
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { Settings } from "@/types/appwrite";

const APPWRITE_COLLECTION_SETTINGS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS_ID || "";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [heroTitle, setHeroTitle] = useState("Creative Developer");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Construyendo experiencias digitales de alto rendimiento que fusionan diseno excepcional con ingenieria robusta."
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SETTINGS_ID);
        if (response.documents.length > 0) {
          const data = response.documents[0] as unknown as Settings;
          if (data.heroTitle) setHeroTitle(data.heroTitle);
          if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
        }
      } catch (error) {
        console.error("Error cargando textos del Hero:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-element-ui",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: "power3.out", delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  return (
    <section ref={containerRef} className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20">
      <div className="absolute left-1/2 top-1/2 h-100 w-200 -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-emerald-500/10 blur-[120px] opacity-40 pointer-events-none" />

      {loading ? (
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      ) : (
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="hero-element-ui mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Disponible para nuevos proyectos
          </div>

          <h1 className="mb-6 py-10 text-6xl font-black leading-[1.1] tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[7rem]">
            {heroTitle}
          </h1>

          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-neutral-400 md:text-xl">
            {heroSubtitle}
          </p>

          <div className="hero-element-ui">
            <a
              href="#projects"
              className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:bg-neutral-200"
            >
              Ver mi trabajo
              <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
