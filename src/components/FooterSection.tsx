"use client";

import { useRef, useEffect } from "react";
import { Github, Linkedin, Twitter, ArrowUpRight } from "lucide-react";

// ============================================================================
// INSTRUCCIONES PARA TU ENTORNO LOCAL:
// 1. Quita los comentarios (//) de las siguientes dos líneas de importación.
// 2. Elimina la sección de "MOCKS" que está justo debajo.
// ============================================================================
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hola@tuportafolio.com";

const socialLinks = [
  { name: "GitHub", icon: <Github className="h-5 w-5" />, url: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/tu-usuario" },
  { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, url: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com/in/tu-usuario" },
  { name: "Twitter / X", icon: <Twitter className="h-5 w-5" />, url: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/tu-usuario" },
];

export default function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- EXPLOSIÓN TIPOGRÁFICA (Título Footer) ---
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "chars" });
        gsap.from(split.chars, {
          y: 50,
          opacity: 0,
          scale: 0.5,
          rotateX: -90,
          duration: 1,
          stagger: 0.05,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
          }
        });
      }

      gsap.fromTo(
        contentRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} id="footer" className="relative z-10 w-full overflow-hidden bg-black/50 border-t border-white/10 pt-24 pb-12 backdrop-blur-md mt-12">
      <div ref={contentRef} className="mx-auto max-w-6xl px-6">
        
        {/* Call to Action principal */}
        <div className="mb-24 flex flex-col items-center text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            ¿Qué sigue?
          </p>
          <h2 
            ref={titleRef}
            className="mb-8 text-5xl font-black tracking-tighter text-white sm:text-7xl perspective-[1000px]"
          >
            Trabajemos 
            <br className="md:hidden" />
            Juntos.
          </h2>
          <p className="max-w-xl text-lg text-neutral-400 mb-10">
            Siempre estoy abierto a discutir nuevos proyectos, ideas creativas o 
            visión para construir el próximo gran producto digital.
          </p>
          
          <a 
            href={`mailto:${CONTACT_EMAIL}`} 
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-black transition-transform hover:scale-105"
          >
            <span>{CONTACT_EMAIL}</span>
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>

        {/* Separador */}
        <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Enlaces y Copyright */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-500 transition-colors hover:text-white"
                aria-label={`Visitar ${link.name}`}
              >
                {link.icon}
              </a>
            ))}
          </div>
          
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Creado con Next.js y Appwrite.
          </p>
        </div>

      </div>
    </footer>
  );
}