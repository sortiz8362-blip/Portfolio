"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Mail, User, MessageSquare } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ID } from "appwrite";
import { databases, APPWRITE_DB_ID } from "../../appwrite";

// Asegúrate de que el usuario haya creado esta variable de entorno
const APPWRITE_COLLECTION_MESSAGES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES_ID || "";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleAccentRef = useRef<HTMLSpanElement>(null);
  const descAccentRef = useRef<HTMLSpanElement>(null);
  const successTitleRef = useRef<HTMLHeadingElement>(null);
  const successDescRef = useRef<HTMLParagraphElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (titleAccentRef.current) {
        const split = new SplitText(titleAccentRef.current, { type: "chars" });
        gsap.set(titleAccentRef.current, { perspective: 1000 });
        gsap.from(split.chars, {
          y: () => gsap.utils.random(-180, -100),
          x: () => gsap.utils.random(-90, 90),
          rotateX: () => gsap.utils.random(-220, 220),
          rotateY: () => gsap.utils.random(-160, 160),
          opacity: 0,
          filter: "blur(10px)",
          duration: 1,
          stagger: { each: 0.02, from: "random" },
          ease: "expo.out",
          scrollTrigger: {
            trigger: titleAccentRef.current,
            start: "top 85%",
          }
        });
      }

      if (descAccentRef.current) {
        const descSplit = new SplitText(descAccentRef.current, { type: "words" });
        gsap.from(descSplit.words, {
          y: 30,
          x: -20,
          opacity: 0,
          duration: 0.75,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: descAccentRef.current,
            start: "top 92%",
          },
        });
      }

      if (successTitleRef.current) {
        const split = new SplitText(successTitleRef.current, { type: "words" });
        gsap.from(split.words, {
          y: 30,
          x: -24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: successTitleRef.current,
            start: "top 94%",
          },
        });
      }

      if (successDescRef.current) {
        const split = new SplitText(successDescRef.current, { type: "lines" });
        gsap.from(split.lines, {
          x: 42,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: successDescRef.current,
            start: "top 94%",
          },
        });
      }

      if (errorRef.current) {
        const split = new SplitText(errorRef.current, { type: "lines" });
        gsap.from(split.lines, {
          y: 26,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: errorRef.current,
            start: "top 95%",
          },
        });
      }

      gsap.fromTo(
        ".contact-element:not(h2)",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );

      // --- REVELADO FLUIDO (Descripción Contacto) ---
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // 1. Guardar en Appwrite
      if (!APPWRITE_COLLECTION_MESSAGES_ID) {
        throw new Error("Missing Appwrite Collection ID for Messages");
      }

      await databases.createDocument(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_MESSAGES_ID,
        ID.unique(),
        {
          name,
          email,
          message,
        }
      );

      // 2. Enviar email con Resend (vía nuestra API local)
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        throw new Error("Error enviando email vía Resend");
      }

      setSubmitStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      
      // Reset después de 3 segundos
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error("Error en el formulario de contacto:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="relative z-10 w-full px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16 contact-element">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl mb-4 perspective-[1000px]">
            ¿<span ref={titleAccentRef} className="text-emerald-500">Hablamos?</span>
          </h2>
          <p className="text-neutral-400 text-lg perspective-[1000px] desc-split">
            Si tienes un proyecto en mente, o simplemente quieres saludar, <span ref={descAccentRef}>envíame un mensaje.</span>
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-900/40 p-8 md:p-12 backdrop-blur-xl shadow-2xl contact-element">
          {submitStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <Send className="h-10 w-10" />
              </div>
              <h3 ref={successTitleRef} className="text-2xl font-bold text-white mb-2">¡Mensaje Enviado!</h3>
              <p ref={successDescRef} className="text-neutral-400">
                Gracias por contactarme, me pondré en contacto contigo lo antes posible.
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Campo Nombre */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-500" /> Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>

                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-500" /> Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Campo Mensaje */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" /> Mensaje
                </label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="¿En qué te puedo ayudar?"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {submitStatus === "error" && (
                <div ref={errorRef} className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                  Hubo un problema al enviar el mensaje. Asegúrate de haber configurado tu base de datos y llaves API.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-8 py-4 text-base font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Enviar Mensaje</span>
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
