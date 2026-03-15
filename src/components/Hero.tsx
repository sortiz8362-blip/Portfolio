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

    const charHandlers: Array<{
      el: HTMLElement;
      onEnter: () => void;
      onDown: () => void;
    }> = [];
    let burstRafId: number | null = null;
    let queuedBurstIndex = -1;
    let lastBurstAt = 0;
    const minBurstGapMs = 95;

    const ctx = gsap.context(() => {
      // Título principal: efecto jello elástico inspirado en la referencia.
      if (titleRef.current) {
        const splitTitle = new SplitText(titleRef.current, { type: "chars", charsClass: "hero-char" });
        const chars = splitTitle.chars as HTMLElement[];

        const jelloBurst = (index: number, intensity = 1) => {
          chars.forEach((char, i) => {
            const distance = Math.abs(i - index);
            const influence = Math.max(0, 1 - distance / 6) * intensity;
            if (influence <= 0) return;

            gsap.to(char, {
              keyframes: [
                {
                  y: -30 * influence,
                  scaleY: 1 + 0.7 * influence,
                  scaleX: 1 - 0.35 * influence,
                  rotateZ: (i % 2 === 0 ? -1 : 1) * 10 * influence,
                  duration: 0.14,
                  ease: "power2.out",
                },
                {
                  y: 10 * influence,
                  scaleY: 1 - 0.3 * influence,
                  scaleX: 1 + 0.18 * influence,
                  rotateZ: (i % 2 === 0 ? 1 : -1) * 7 * influence,
                  duration: 0.16,
                  ease: "power2.inOut",
                },
                {
                  y: 0,
                  scaleY: 1,
                  scaleX: 1,
                  rotateZ: 0,
                  duration: 0.7,
                  ease: "elastic.out(1, 0.38)",
                },
              ],
              overwrite: "auto",
            });
          });
        };

        const triggerBurst = (index: number, intensity: number, force = false) => {
          const now = performance.now();
          const canRunNow = force || now - lastBurstAt >= minBurstGapMs;

          if (canRunNow) {
            lastBurstAt = now;
            jelloBurst(index, intensity);
            return;
          }

          queuedBurstIndex = index;
          if (burstRafId !== null) return;

          burstRafId = requestAnimationFrame(() => {
            burstRafId = null;
            if (queuedBurstIndex < 0) return;
            const queuedIndex = queuedBurstIndex;
            queuedBurstIndex = -1;
            lastBurstAt = performance.now();
            jelloBurst(queuedIndex, Math.min(intensity, 0.7));
          });
        };

        gsap.set(titleRef.current, { perspective: 1000 });
        gsap.set(chars, {
          transformOrigin: "50% 100%",
          willChange: "transform, filter",
        });

        gsap.from(chars, {
          y: () => -window.innerHeight - gsap.utils.random(180, 420),
          x: () => gsap.utils.random(-80, 80),
          rotateX: () => gsap.utils.random(-240, 240),
          rotateY: () => gsap.utils.random(-170, 170),
          rotateZ: () => gsap.utils.random(-80, 80),
          scaleY: 2.2,
          scaleX: 0.72,
          fontWeight: 420,
          opacity: 0,
          filter: "blur(12px)",
          duration: 1.55,
          stagger: { each: 0.05, from: "random" },
          ease: "elastic.out(0.24, 0.12)",
          delay: 0.15,
          onComplete: () => {
            const centerIndex = Math.floor(chars.length / 2);
            jelloBurst(centerIndex, 0.95);
          },
        });

        chars.forEach((char, index) => {
          const onEnter = () => triggerBurst(index, 0.8);
          const onDown = () => triggerBurst(index, 1.15, true);
          char.addEventListener("mouseenter", onEnter);
          char.addEventListener("mousedown", onDown);
          charHandlers.push({ el: char, onEnter, onDown });
        });
      }

      if (subtitleRef.current) {
        const splitSubtitle = new SplitText(subtitleRef.current, { type: "lines" });
        gsap.from(splitSubtitle.lines, {
          yPercent: 120,
          opacity: 0,
          filter: "blur(6px)",
          duration: 1,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.35,
        });
      }

      // Animamos el resto de elementos (Badge y Botones)
      gsap.fromTo(
        ".hero-element:not(h1):not(p)",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: "power3.out", delay: 0.6 }
      );
    }, containerRef);

    return () => {
      if (burstRafId !== null) {
        cancelAnimationFrame(burstRafId);
      }
      charHandlers.forEach(({ el, onEnter, onDown }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mousedown", onDown);
      });
      ctx.revert();
    };
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