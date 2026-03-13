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
      // Animar el título de la sección
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%", // Empieza cuando el top del título toca el 80% de la pantalla
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
          stagger: 0.2, // Retraso entre cada tarjeta
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
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
          Trabajos <span className="text-neutral-500">Destacados</span>
        </h2>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-neutral-400 text-lg">Próximamente nuevos proyectos.</p>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {projects.map((project) => (
              <div 
                key={project.$id} 
                ref={addToCardsRef}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm transition-all hover:border-white/20"
              >
                {/* Contenedor de la Imagen */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-transparent to-transparent" />
                </div>

                {/* Contenido (Textos y Botones) */}
                <div className="flex flex-col flex-1 p-8">
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}