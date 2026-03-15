"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";

// ============================================================================
// INSTRUCCIONES: Quita comentarios y MOCKS en local.
// ============================================================================
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { Settings } from "@/types/appwrite";
// import { SplitText as CustomSplitText } from "@/utils/SplitText"; // Retiramos el custom para usar el oficial
const APPWRITE_COLLECTION_SETTINGS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS_ID || "";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  
  const [heroTitle, setHeroTitle] = useState("Creative Developer");
  const [heroSubtitle, setHeroSubtitle] = useState("Construyendo experiencias digitales de alto rendimiento que fusionan diseño excepcional con ingeniería robusta.");
  const [loading, setLoading] = useState(true);

  // 1. Obtener los datos de Configuración
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

  // 2. Animar con GSAP una vez que los datos cargaron
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // --- EXPLOSIÓN TIPOGRÁFICA (Título) ---
      if (titleRef.current) {
        const splitTitle = new SplitText(titleRef.current, { type: "chars, words" });
        gsap.from(splitTitle.chars, {
          x: "random(-400, 400)",
          y: "random(-400, 400)",
          z: "random(-500, 500)",
          rotationX: "random(-360, 360)",
          rotationY: "random(-360, 360)",
          rotationZ: "random(-360, 360)",
          scale: "random(0, 2)",
          opacity: 0,
          filter: "blur(20px)",
          duration: 2,
          stagger: { amount: 1, from: "random" },
          ease: "expo.out",
          delay: 0.2
        });
      }

      // Animamos el resto de elementos (Badge y Botones)
      gsap.fromTo(
        ".hero-element:not(h1):not(p)",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 1.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // Formatear el título para que, si tiene más de 2 palabras, se divida bonito
  // o simplemente lo dejamos que fluya naturalmente con el ancho.
  // Lo dejamos fluido para que se adapte al nombre.

  return (
    <section ref={containerRef} className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20">
      
      {/* Fondo con resplandor sutil (Opcional, para darle ese toque premium) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />

      {loading ? (
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      ) : (
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Badge: Disponible */}
          <div className="hero-element mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Disponible para nuevos proyectos
          </div>

          {/* Título Principal Dinámico */}
          <h1 
            ref={titleRef}
            className="hero-element mb-6 text-6xl font-black tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[7rem] leading-[1.1] perspective-[1000px] py-10"
          >
            {heroTitle}
          </h1>

          {/* Subtítulo Dinámico */}
          <p 
            ref={subtitleRef}
            className="hero-element mb-12 max-w-2xl text-lg text-neutral-400 md:text-xl leading-relaxed perspective-[1000px]"
          >
            {heroSubtitle}
          </p>

          {/* Botón CTA */}
          <div className="hero-element">
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