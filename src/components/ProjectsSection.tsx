"use client";

import { useEffect, useState, useRef } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

// ============================================================================
// INSTRUCCIONES PARA TU ENTORNO LOCAL:
// 1. Quita los comentarios (//) de las siguientes tres líneas de importación.
// 2. Elimina la sección de "MOCKS" que está justo debajo.
// ============================================================================
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { databases, APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID } from "../../appwrite";
import { Project } from "@/types/appwrite";
import { SplitText } from "@/utils/SplitText";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Referencias para las animaciones
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 1. Obtener los proyectos de Appwrite
    const fetchProjects = async () => {
      try {
        const response = await databases.listDocuments(
          APPWRITE_DB_ID,
          APPWRITE_COLLECTION_PROJECTS_ID
        );
        // Filtramos para mostrar solo los que tienen isVisible en true
        const visibleProjects = (response.documents as unknown as Project[]).filter((doc) => doc.isVisible === true);
        setProjects(visibleProjects);
      } catch (error) {
        console.error("Error al cargar proyectos públicos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 2. Configurar animaciones GSAP una vez que los proyectos cargan
  useEffect(() => {
    if (loading || projects.length === 0) return;

    const ctx = gsap.context(() => {
      // Animar el título de la sección con efecto de "pintado"
      gsap.fromTo(
        titleRef.current?.querySelectorAll(".split-char") || [],
        { 
          opacity: 0, 
          color: "#ffffff" 
        },
        {
          opacity: 1,
          color: (index, target) => {
            // El color emite un destello esmeralda antes de volver a blanco o gris
            return target.innerText === "Destacados" ? "#10b981" : "#ffffff";
          },
          stagger: 0.03,
          duration: 0.8,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
          },
        }
      );

      // Animar las tarjetas de proyectos una por una (stagger)
      gsap.fromTo(
        cardsRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

      // --- Animación Inteligente Adaptativa (Móvil vs PC) ---
      const mm = gsap.matchMedia();

      // En MÓVILES y TABLETS (pantallas pequeñas), las tarjetas flotan solas
      mm.add("(max-width: 1023px)", () => {
        cardsRef.current.forEach((card) => {
          if (!card) return;
          // Efecto circular coordinado para evitar estiramientos
          gsap.to(card, {
            rotateX: 2.5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformPerspective: 2000
          });
          gsap.to(card, {
            rotateY: 2.5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformPerspective: 2000,
            delay: -1 // Desfase para crear el círculo
          });
        });
      });
      // ------------------------------------------------------
    }, sectionRef);

    return () => ctx.revert(); // Limpieza vital en React
  }, [loading, projects]);

  // Función para agregar tarjetas al array de referencias
  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <section ref={sectionRef} id="projects" className="relative z-10 w-full px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 
          ref={titleRef}
          className="mb-16 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          <SplitText text="Trabajos " />
          <SplitText text="Destacados" charClassName="text-emerald-500" />
        </h2>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-neutral-400 text-lg">Próximamente nuevos proyectos.</p>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {projects.map((project) => {
              const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10 deg
                const rotateY = ((x - centerX) / centerX) * 10;
                
                gsap.to(card, {
                  rotateX,
                  rotateY,
                  transformPerspective: 1000,
                  duration: 0.5,
                  ease: "power2.out"
                });
              };

              const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
                gsap.to(e.currentTarget, {
                  rotateX: 0,
                  rotateY: 0,
                  duration: 0.5,
                  ease: "power2.out"
                });
              };

              return (
                <div 
                  key={project.$id} 
                  ref={addToCardsRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm transition-all hover:border-white/20 shadow-2xl"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Contenedor de la Imagen */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950" style={{ transform: "translateZ(20px)" }}>
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-linear-to-t from-neutral-900/90 via-transparent to-transparent" />
                  </div>

                  {/* Contenido (Textos y Botones) */}
                  <div className="flex flex-col flex-1 p-8" style={{ transform: "translateZ(40px)" }}>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {project.title}
                    </h3>
                    <p className="text-neutral-400 mb-8 flex-1">
                      {project.description}
                    </p>
                    
                    {/* Botones de Acción */}
                    <div className="flex items-center gap-4 mt-auto">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
                        >
                          Visitar sitio <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}