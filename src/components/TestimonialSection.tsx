"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, MessageSquareQuote, Send, X } from "lucide-react";

// ============================================================================
// INSTRUCCIONES: Quita comentarios y MOCKS.
// ============================================================================
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { ID } from "appwrite";
import { Testimonial } from "@/types/appwrite";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}
const APPWRITE_COLLECTION_TESTIMONIALS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TESTIMONIALS_ID || "";

// SUGERENCIAS PARA EL CARGO
const RELATION_SUGGESTIONS = ["Cliente", "Colaborador", "Compañero de Trabajo", "Jefe / Supervisor", "CEO", "CTO", "Product Manager", "Diseñador", "Mentor"];

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionDescRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const msgRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_TESTIMONIALS_ID);
        const approved = (response.documents as unknown as Testimonial[]).filter((doc) => doc.isApproved === true);
        setTestimonials(approved);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (loading || testimonials.length === 0) return;
    const ctx = gsap.context(() => {
      // --- EXPLOSIÓN TIPOGRÁFICA (Título Testimonios) ---
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "chars" });
        gsap.from(split.chars, {
          x: "random(-400, 400)",
          y: "random(-200, 200)",
          scale: 0,
          opacity: 0,
          filter: "blur(15px)",
          duration: 1.5,
          stagger: { amount: 0.6, from: "random" },
          ease: "expo.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
          }
        });
      }

      // --- REVELADO FLUIDO (Descripción Sección) ---
      if (sectionDescRef.current) {
        const split = new SplitText(sectionDescRef.current, { type: "chars" });
        // Revelado base
        gsap.from(split.chars, {
          rotateY: 360,
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          stagger: 0.01,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionDescRef.current,
            start: "top 85%",
          }
        });

        // Barrido seguidor
        gsap.fromTo(split.chars,
          { color: "inherit" },
          {
            color: "#10b981",
            duration: 0.3,
            stagger: 0.01,
            repeat: 1,
            yoyo: true,
            delay: 0.1,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: sectionDescRef.current,
              start: "top 85%",
            }
          }
        );
      }

      // --- REVELADO FLUIDO (Mensajes Testimonios) ---
      msgRefs.current.forEach((msg) => {
        if (!msg) return;
        const split = new SplitText(msg, { type: "chars" });
        // Revelado base
        gsap.from(split.chars, {
          rotateY: 360,
          opacity: 0,
          scale: 0.9,
          duration: 0.6,
          stagger: 0.005,
          ease: "power1.out",
          scrollTrigger: {
            trigger: msg,
            start: "top 90%",
          }
        });

        // Barrido seguidor
        gsap.fromTo(split.chars,
          { color: "inherit" },
          {
            color: "#10b981",
            duration: 0.3,
            stagger: 0.005,
            repeat: 1,
            yoyo: true,
            delay: 0.05,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: msg,
              start: "top 90%",
            }
          }
        );
      });
      gsap.fromTo(cardsRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } });

      // --- Animación Inteligente Adaptativa (Móvil vs PC) ---
      const mm = gsap.matchMedia();

      // En MÓVILES las tarjetas de testimonios tienen un tilt estático
      mm.add("(max-width: 1023px)", () => {
        cardsRef.current.forEach((card) => {
          if (!card) return;
          gsap.set(card, {
            rotateX: 2,
            rotateY: 2,
            transformPerspective: 2000
          });
        });
      });
      // ------------------------------------------------------
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, testimonials]);

  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
  };

  const addToMsgRefs = (el: HTMLParagraphElement | null) => {
    if (el && !msgRefs.current.includes(el)) msgRefs.current.push(el);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await databases.createDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_TESTIMONIALS_ID, ID.unique(), {
        name, role, message, isApproved: false
      });
      setSubmitSuccess(true);
      setName(""); setRole(""); setMessage("");
      setTimeout(() => { setIsModalOpen(false); setSubmitSuccess(false); }, 3000);
    } catch (error) { console.error(error); alert("Error al enviar."); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <section ref={sectionRef} className="relative z-10 w-full px-6 py-24 md:py-32 bg-neutral-950/50">
      <div className="mx-auto max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 
          ref={titleRef}
          className="mb-16 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl perspective-[1000px]"
        >
          Lo que dicen <span className="text-emerald-500">sobre mi trabajo</span>
        </h2>
            <p 
              ref={sectionDescRef}
              className="text-neutral-400 text-lg max-w-xl perspective-[1000px]"
            >
              Experiencias reales de personas y empresas con las que he colaborado.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-black">
            <MessageSquareQuote className="h-4 w-4" /> Dejar un testimonio
          </button>
        </div>

        {loading ? (
           <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
        ) : testimonials.length === 0 ? (
          <div className="border border-white/5 bg-white/5 rounded-3xl p-12 text-center backdrop-blur-sm">
            <MessageSquareQuote className="h-12 w-12 text-neutral-600 mx-auto mb-4 opacity-50" />
            <p className="text-neutral-500">Aún no hay testimonios públicos. ¡Sé el primero en dejar uno!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div 
                key={t.$id} 
                ref={addToCardsRef} 
                onMouseMove={(e) => {
                  if (window.innerWidth < 1024) return;
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
                  const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
                  gsap.to(card, { rotateX, rotateY, transformPerspective: 1000, duration: 0.5, ease: "power2.out" });
                }}
                onMouseLeave={(e) => {
                  if (window.innerWidth < 1024) return;
                  gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
                }}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/40 p-8 backdrop-blur-md transition-colors hover:border-white/20 shadow-xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div style={{ transform: "translateZ(40px)" }}>
                  <MessageSquareQuote className="h-8 w-8 text-neutral-700 mb-6" />
                </div>
                <p 
                  ref={addToMsgRefs}
                  className="text-neutral-300 italic mb-8 flex-1 leading-relaxed perspective-[1000px]" 
                  style={{ transform: "translateZ(20px)" }}
                >
                  &quot;{t.message}&quot;
                </p>
                <div className="border-t border-white/10 pt-6" style={{ transform: "translateZ(30px)" }}>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-emerald-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-2">Comparte tu experiencia</h3>
            <p className="text-neutral-400 mb-8 text-sm">Tu testimonio será revisado antes de aparecer en el portafolio.</p>

            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">¡Gracias por tu mensaje!</h4>
                <p className="text-neutral-400">Lo he recibido correctamente y pronto estará en el portafolio.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Tu Nombre</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Ana García" className="w-full rounded-xl bg-black border border-white/10 p-3.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Tu Cargo o Relación</label>
                  {/* CAMBIO: list="relation-list" */}
                  <input required type="text" list="relation-list" value={role} onChange={e => setRole(e.target.value)} placeholder="Ej. Cliente, Colaborador, CTO..." className="w-full rounded-xl bg-black border border-white/10 p-3.5 text-white focus:border-emerald-500 focus:outline-none transition-colors" />
                  <datalist id="relation-list">
                    {RELATION_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Tu Mensaje</label>
                  <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="¿Cómo fue trabajar juntos?" className="w-full rounded-xl bg-black border border-white/10 p-3.5 text-white focus:border-emerald-500 focus:outline-none transition-colors h-32 resize-none" />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-bold text-black transition-transform hover:bg-neutral-200 disabled:opacity-50 mt-4">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Enviar Testimonio</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}