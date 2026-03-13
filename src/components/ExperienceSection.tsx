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
const APPWRITE_COLLECTION_EXPERIENCE_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXPERIENCE_ID || "";

if (typeof window !== "undefined" && (gsap as any).registerPlugin) {
  (gsap as any).registerPlugin(ScrollTrigger);
}

interface Experience {
  $id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  isVisible: boolean;
}

export default function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_EXPERIENCE_ID);
        // Filtramos solo los visibles
        const visible = response.documents.filter((doc: any) => doc.isVisible === true);
        setExperiences(visible as unknown as Experience[]);
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
      // Animar la línea vertical creciendo hacia abajo
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: 1, // La línea crece con el scroll
          },
        }
      );

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
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl mb-4">
            Mi <span className="text-emerald-500">Trayectoria</span>
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
            
            {/* La Línea Vertical Animada (Progreso) */}
            <div ref={lineRef} className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-400 to-transparent" />

            <div className="space-y-12 pb-12">
              {experiences.map((exp, index) => (
                <div key={exp.$id} ref={addToItemsRef} className="relative pl-12 md:pl-24">
                  
                  {/* El "Punto" en la línea de tiempo */}
                  <div className="absolute left-[11px] md:left-[27px] top-1.5 h-4 w-4 rounded-full border-4 border-neutral-950 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10" />

                  {/* Tarjeta de Contenido */}
                  <div className="group rounded-2xl border border-white/10 bg-neutral-900/40 p-6 md:p-8 backdrop-blur-md transition-all hover:border-emerald-500/30 hover:bg-neutral-900/60">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
                    
                    <p className="text-neutral-400 leading-relaxed">
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