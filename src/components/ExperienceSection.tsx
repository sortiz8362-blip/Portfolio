"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Briefcase, Calendar } from "lucide-react";

// ============================================================================
// INSTRUCCIONES:
// 1. Quita los comentarios de las importaciones.
// 2. Elimina la sección MOCKS.
// ============================================================================
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { Experience } from "@/types/appwrite";
import { SplitText } from "@/utils/SplitText";
const APPWRITE_COLLECTION_EXPERIENCE_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXPERIENCE_ID || "";

export default function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_EXPERIENCE_ID);
        // Filtramos solo los visibles
        const visible = (response.documents as unknown as Experience[]).filter((doc) => doc.isVisible === true);
        setExperiences(visible);
      } catch (error) {
        console.error("Error cargando experiencia:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperience();
  }, []);

  useEffect(() => {
    if (loading || experiences.length === 0) return;

    const ctx = gsap.context(() => {
      // Animar el dibujo del trazo SVG
      const path = pathRef.current;
      if (path) {
        const length = path.getTotalLength();
        
        // Seteamos el estado inicial del trazo
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: 1,
          },
        });
      }

      // Animar cada elemento de la línea de tiempo apareciendo desde los lados
      itemsRef.current.forEach((item, i) => {
        if (!item) return;
        
        // Alternamos la dirección de entrada si queremos (ej. izq/der en desktop)
        // Por simplicidad y elegancia en móvil/desktop, usaremos un fade up con ligero desplazamiento
        gsap.fromTo(
          item,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
            },
          }
        );
      });

      // --- Animación Inteligente Adaptativa (Móvil vs PC) ---
      const mm = gsap.matchMedia();

      // En MÓVILES las tarjetas se balancean solas
      mm.add("(max-width: 1023px)", () => {
        itemsRef.current.forEach((item) => {
          if (!item) return;
          const card = item.querySelector(".group"); // Buscamos la tarjeta real dentro del contenedor
          if (card) {
            gsap.to(card, {
              rotateX: "random(-3, 3)",
              rotateY: "random(-3, 3)",
              duration: "random(2, 4)",
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformPerspective: 1000
            });
          }
        });
      });
      // ------------------------------------------------------
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, experiences]);

  const addToItemsRef = (el: HTMLDivElement | null) => {
    if (el && !itemsRef.current.includes(el)) {
      itemsRef.current.push(el);
    }
  };

  return (
    <section ref={sectionRef} id="experience" className="relative z-10 w-full px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl mb-4 perspective-[1000px]">
            <SplitText text="Mi " />
            <SplitText text="Trayectoria" charClassName="text-emerald-500" />
          </h2>
          <p className="text-neutral-400 text-lg">
            Un resumen de mi evolución profesional y los lugares donde he dejado mi huella.
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : experiences.length === 0 ? (
          <p className="text-neutral-500 text-center py-12 border border-white/5 rounded-2xl bg-white/5">
            Aún construyendo mi historia profesional...
          </p>
        ) : (
          <div className="relative">
            {/* La Línea Vertical Principal (Fondo) */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-neutral-800" />
            
            {/* La Línea Vertical Animada (SVG Drawing) */}
            <svg 
              className="absolute left-4 md:left-8 top-0 bottom-0 w-1 pointer-events-none" 
              viewBox="0 0 4 100" 
              preserveAspectRatio="none"
            >
              <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
              <path
                ref={pathRef}
                d="M 2 0 L 2 100"
                stroke="url(#line-gradient)"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            <div className="space-y-12 pb-12">
              {experiences.map((exp, index) => (
                <div key={exp.$id} ref={addToItemsRef} className="relative pl-12 md:pl-24">
                  
                  {/* El "Punto" en la línea de tiempo */}
                  <div className="absolute left-[11px] md:left-[27px] top-1.5 h-4 w-4 rounded-full border-4 border-neutral-950 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10" />

                  {/* Tarjeta de Contenido */}
                  <div 
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const rect = card.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
                      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
                      gsap.to(card, { rotateX, rotateY, transformPerspective: 1000, duration: 0.5, ease: "power2.out" });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
                    }}
                    className="group rounded-2xl border border-white/10 bg-neutral-900/40 p-6 md:p-8 backdrop-blur-md transition-all hover:border-emerald-500/30 hover:bg-neutral-900/60 shadow-xl"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4" style={{ transform: "translateZ(30px)" }}>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                          {exp.role}
                        </h3>
                        <p className="text-lg font-medium text-neutral-300 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-emerald-500" /> {exp.company}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 text-sm text-neutral-400 shrink-0">
                        <Calendar className="h-4 w-4" />
                        {exp.duration}
                      </div>
                    </div>
                    
                    <p className="text-neutral-400 leading-relaxed" style={{ transform: "translateZ(20px)" }}>
                      {exp.description}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}