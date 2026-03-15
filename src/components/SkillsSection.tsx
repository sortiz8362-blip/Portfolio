"use client";

import { useEffect, useRef, useState } from "react";
import { Layout, Database, Terminal, User, Star, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { Skill, Settings } from "@/types/appwrite";
// import { SplitText as CustomSplitText } from "@/utils/SplitText"; // Retiramos el custom para usar el oficial
import SkillIcon from "./SkillIcon";

const APPWRITE_COLLECTION_SKILLS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SKILLS_ID || "";
const APPWRITE_COLLECTION_SETTINGS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS_ID || "";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
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
  skills: { name: string; percentage: number }[];
}

export default function SkillsSection() {
  const [groupedSkills, setGroupedSkills] = useState<GroupedSkill[]>([]);
  const [aboutText, setAboutText] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const aboutParaRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, settingsRes] = await Promise.all([
          databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID),
          databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SETTINGS_ID)
        ]);

        if (settingsRes.documents.length > 0) {
          const settingsData = settingsRes.documents[0] as unknown as Settings;
          setAboutText(settingsData.aboutText);
          setProfileImageUrl(settingsData.profileImageUrl || "");
        }

        const visibleSkills = (skillsRes.documents as unknown as Skill[]).filter((s) => s.isVisible);
        const categoriesMap = new Map<string, { name: string; percentage: number }[]>();

        visibleSkills.forEach((skill) => {
          if (!categoriesMap.has(skill.category)) categoriesMap.set(skill.category, []);
          categoriesMap.get(skill.category)!.push({ name: skill.name, percentage: skill.percentage || 0 });
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
      // --- EXPLOSIÓN TIPOGRÁFICA (Título: Sobre Mí) ---
      if (headerRef.current) {
        const titleH2 = headerRef.current.querySelector("h2");
        if (titleH2) {
          const split = new SplitText(titleH2, { type: "chars" });
          gsap.from(split.chars, {
            x: "random(-200, 200)",
            y: "random(-200, 200)",
            z: "random(-300, 300)",
            rotationX: "random(-180, 180)",
            rotationY: "random(-180, 180)",
            rotationZ: "random(-180, 180)",
            scale: 0,
            opacity: 0,
            filter: "blur(10px)",
            duration: 1.5,
            stagger: { amount: 0.5, from: "random" },
            ease: "expo.out",
            scrollTrigger: {
              trigger: titleH2,
              start: "top 85%",
            }
          });
        }
      }

      // Animación de las categorías
      gsap.fromTo(
        ".skill-category-card",
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } 
        }
      );

      // Animación de la foto de perfil (se mantiene igual)
      const tl = gsap.timeline({
        scrollTrigger: { trigger: headerRef.current, start: "top 70%" }
      });
      tl.to(".photo-draw-circle", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" })
        .to(".profile-photo-img", { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.5");

    }, sectionRef);
    return () => ctx.revert();
  }, [loading, groupedSkills]);

  return (
    <section 
      ref={sectionRef} 
      id="about" 
      className="relative z-10 w-full px-6 py-24 md:py-32"
      suppressHydrationWarning
    >
      <div className="mx-auto max-w-6xl">
        
        {/* Encabezado: Sobre Mí */}
        <div ref={headerRef} className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20 items-center">
          <div className="order-2 md:order-1">
            <h2 className="mb-8 text-4xl font-bold tracking-tight text-white md:text-5xl perspective-[1000px]">
              Sobre <span className="text-emerald-500">Mí</span>
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
                <div className="h-4 bg-white/10 rounded w-4/6"></div>
              </div>
            ) : (
              <p 
                ref={aboutParaRef}
                className="text-lg text-neutral-400 leading-relaxed whitespace-pre-line perspective-[1000px]"
              >
                {aboutText}
              </p>
            )}
          </div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div 
              onMouseMove={(e) => {
                if (window.innerWidth < 1024) return;
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15;
                const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 15;
                gsap.to(card, { rotateX, rotateY, transformPerspective: 1000, duration: 0.5, ease: "power2.out" });
              }}
              onMouseLeave={(e) => {
                if (window.innerWidth < 1024) return;
                gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
              }}
              className="relative h-64 w-64 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.1)] group transition-all duration-300"
              style={{ transformStyle: "preserve-3d" }}
            >
              <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none z-20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="301.6" strokeDashoffset="301.6" className="photo-draw-circle" />
              </svg>
              <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-neutral-900/50 p-3 backdrop-blur-md" style={{ transform: "translateZ(30px)" }}>
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-neutral-800/80 border border-white/5 overflow-hidden">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Foto de Perfil" className="profile-photo-img h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-0 scale-95" />
                  ) : (
                    <User className="h-28 w-28 text-neutral-500" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones de Habilidades */}
        <div className="space-y-16">
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
          ) : groupedSkills.length === 0 ? (
            <p className="text-neutral-500 text-center border border-white/5 rounded-3xl py-20 bg-white/5 backdrop-blur-sm">Aún no hay habilidades registradas.</p>
          ) : (
            groupedSkills.map((category, catIndex) => (
              <div key={catIndex} className="skill-category-card">
                <div className="flex items-center gap-4 mb-8">
                  <div className="rounded-2xl bg-neutral-900/80 p-3 border border-white/10 shadow-lg">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{category.title}</h3>
                  <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent ml-4"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {category.skills.map((skill, skillIndex) => {
                    return (
                      <SkillCard key={skillIndex} name={skill.name} percentage={skill.percentage} />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function SkillCard({ name, percentage }: { name: string; percentage: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const progressInnerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!cardRef.current || !progressInnerRef.current) return;

    const ctx = gsap.context(() => {
      const counter = { value: 0 };
      
      gsap.fromTo(progressInnerRef.current, 
        { width: "0%" },
        { 
          width: `${percentage}%`, 
          duration: 1.5, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
          }
        }
      );

      gsap.to(counter, {
        value: percentage,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.innerText = Math.round(counter.value).toString();
          }
        },
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
        }
      });
    }, cardRef);

    return () => ctx.revert();
  }, [percentage]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    
    const card = e.currentTarget;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * 20;

    // Efecto Tilt Suave (Sin Pop-out como en Proyectos)
    gsap.to(card, {
      rotateX,
      rotateY,
      scale: 1,
      z: 10,
      transformPerspective: 1000,
      duration: 0.5,
      ease: "power2.out"
    });

    // Efecto de Brillo (Glow)
    if (glowRef.current) {
        gsap.to(glowRef.current, {
            left: x,
            top: y,
            opacity: 1,
            duration: 0.3
        });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      z: 0,
      duration: 0.6,
      ease: "power2.out"
    });

    if (glowRef.current) {
        gsap.to(glowRef.current, {
            opacity: 0,
            duration: 0.4
        });
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col items-start gap-3 rounded-xl border border-white/5 bg-neutral-900/40 p-3 backdrop-blur-md transition-colors duration-300 hover:border-emerald-500/30 hover:bg-neutral-800/60 overflow-hidden cursor-default"
      style={{ transformStyle: "preserve-3d" }}
      suppressHydrationWarning
    >
      {/* Brillo dinámico */}
      <div 
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl opacity-0 w-32 h-32"
        style={{ zIndex: 0 }}
      ></div>

      <div className="relative z-10 w-full flex flex-col gap-4" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-black/40 p-2.5 transition-all duration-500 group-hover:bg-emerald-500/10 text-neutral-400 group-hover:text-emerald-400">
              <SkillIcon name={name} className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-white transition-colors duration-300">
              {name}
            </span>
          </div>
          <div className="text-xs font-bold text-emerald-400/80">
            <span ref={counterRef}>0</span>%
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
                ref={progressInnerRef}
                className="absolute top-0 left-0 h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            ></div>
        </div>
      </div>
    </div>
  );
}