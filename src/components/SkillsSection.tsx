"use client";

import { useEffect, useRef, useState } from "react";
import { Layout, Database, Terminal, User, Star, Loader2 } from "lucide-react";

// ============================================================================
// INSTRUCCIONES:
// 1. Quita los comentarios (//) de las importaciones.
// 2. Elimina la sección MOCKS.
// ============================================================================
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { Skill, Settings } from "@/types/appwrite";
const APPWRITE_COLLECTION_SKILLS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SKILLS_ID || "";
const APPWRITE_COLLECTION_SETTINGS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS_ID || "";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Frontend": return <Layout className="h-6 w-6 text-emerald-400" />;
    case "Backend": return <Database className="h-6 w-6 text-blue-400" />;
    case "Herramientas": return <Terminal className="h-6 w-6 text-amber-400" />;
    default: return <Star className="h-6 w-6 text-purple-400" />;
  }
};

interface GroupedSkill {
  title: string;
  icon: React.ReactNode;
  skills: string[];
}

export default function SkillsSection() {
  const [groupedSkills, setGroupedSkills] = useState<GroupedSkill[]>([]);
  const [aboutText, setAboutText] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(""); // <-- Estado para tu foto
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, settingsRes] = await Promise.all([
          databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID),
          databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SETTINGS_ID)
        ]);

        // Procesar Configuración
        if (settingsRes.documents.length > 0) {
          const settingsData = settingsRes.documents[0] as unknown as Settings;
          setAboutText(settingsData.aboutText);
          setProfileImageUrl(settingsData.profileImageUrl || ""); // Obtenemos la foto
        }

        // Procesar Habilidades
        const visibleSkills = (skillsRes.documents as unknown as Skill[]).filter((s) => s.isVisible);
        const categoriesMap = new Map<string, string[]>();

        visibleSkills.forEach((skill) => {
          if (!categoriesMap.has(skill.category)) categoriesMap.set(skill.category, []);
          categoriesMap.get(skill.category)!.push(skill.name);
        });

        const grouped = Array.from(categoriesMap.entries()).map(([cat, skillsArr]) => ({
          title: cat,
          icon: getCategoryIcon(cat),
          skills: skillsArr
        }));

        setGroupedSkills(grouped);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: headerRef.current, start: "top 80%" } });
      gsap.fromTo(cardsRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)", scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, groupedSkills]);

  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
  };

  return (
    <section ref={sectionRef} id="about" className="relative z-10 w-full px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        
        {/* Encabezado: Sobre Mí */}
        <div ref={headerRef} className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Sobre <span className="text-emerald-500">Mí</span>
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-lg text-neutral-400 leading-relaxed whitespace-pre-line">
                {aboutText}
              </p>
            )}
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative h-64 w-64 overflow-hidden rounded-full border border-white/10 bg-neutral-900/50 p-2 shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-sm group">
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-neutral-800/80 border border-white/5 overflow-hidden">
                {profileImageUrl ? (
                  <img 
                    src={profileImageUrl} 
                    alt="Foto de Perfil" 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <User className="h-24 w-24 text-neutral-500" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de Habilidades */}
        {loading ? (
           <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
        ) : groupedSkills.length === 0 ? (
          <p className="text-neutral-500 text-center border border-white/5 rounded-2xl py-12 bg-white/5">Aún no hay habilidades registradas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {groupedSkills.map((category, index) => (
              <div key={index} ref={addToCardsRef} className="flex flex-col rounded-3xl border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-md transition-colors hover:bg-neutral-800/60">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-xl bg-neutral-950 p-3 border border-white/5 shadow-inner">{category.icon}</div>
                  <h3 className="text-xl font-bold text-white">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/10 hover:text-white cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}