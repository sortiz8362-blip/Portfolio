"use client";

import { useState, useEffect } from "react";
import { Loader2, FolderKanban, MessageSquare, Briefcase, TrendingUp, Users, Activity, CheckCircle, Clock } from "lucide-react";

// ============================================================================
// INSTRUCCIONES:
// 1. Quita los comentarios (//) de las siguientes tres líneas.
// 2. Elimina la sección de "MOCKS".
// ============================================================================
import { databases, APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID } from "../../appwrite";
const APPWRITE_COLLECTION_TESTIMONIALS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TESTIMONIALS_ID || "";
const APPWRITE_COLLECTION_EXPERIENCE_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXPERIENCE_ID || "";

interface Stats {
  projects: { total: number; public: number; draft: number };
  testimonials: { total: number; approved: number; pending: number };
  experience: { total: number };
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Ejecutamos las promesas en paralelo para mayor velocidad
        const [projectsRes, testimonialsRes, experienceRes] = await Promise.all([
          databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID),
          databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_TESTIMONIALS_ID),
          databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_EXPERIENCE_ID),
        ]);

        const projects = (projectsRes as any).documents;
        const testimonials = (testimonialsRes as any).documents;
        const experience = (experienceRes as any).total;

        setStats({
          projects: {
            total: projects.length,
            public: projects.filter((p: any) => p.isVisible).length,
            draft: projects.filter((p: any) => !p.isVisible).length,
          },
          testimonials: {
            total: testimonials.length,
            approved: testimonials.filter((t: any) => t.isApproved).length,
            pending: testimonials.filter((t: any) => !t.isApproved).length,
          },
          experience: {
            total: experience,
          },
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Tarjetas Principales (KPIs) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Proyectos */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-sm transition-all hover:bg-neutral-900/60 hover:border-emerald-500/30">
          <div className="absolute -right-6 -top-6 text-white/5">
            <FolderKanban className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-neutral-400">Proyectos Totales</h3>
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-400">
                <FolderKanban className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white">{stats.projects.total}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="h-4 w-4" /> {stats.projects.public} Públicos
              </span>
              <span className="flex items-center gap-1 text-neutral-500">
                <Activity className="h-4 w-4" /> {stats.projects.draft} Ocultos
              </span>
            </div>
          </div>
        </div>

        {/* Testimonios */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-sm transition-all hover:bg-neutral-900/60 hover:border-amber-500/30">
          <div className="absolute -right-6 -top-6 text-white/5">
            <MessageSquare className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-neutral-400">Testimonios</h3>
              <div className="rounded-md bg-amber-500/10 p-2 text-amber-400">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white">{stats.testimonials.total}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="h-4 w-4" /> {stats.testimonials.approved} Aprobados
              </span>
              <span className={`flex items-center gap-1 ${stats.testimonials.pending > 0 ? 'text-amber-400 font-medium' : 'text-neutral-500'}`}>
                <Clock className="h-4 w-4" /> {stats.testimonials.pending} Pendientes
              </span>
            </div>
          </div>
        </div>

        {/* Experiencia */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 p-6 backdrop-blur-sm transition-all hover:bg-neutral-900/60 hover:border-blue-500/30">
          <div className="absolute -right-6 -top-6 text-white/5">
            <Briefcase className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-neutral-400">Trayectoria</h3>
              <div className="rounded-md bg-blue-500/10 p-2 text-blue-400">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white">{stats.experience.total}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-blue-400">
                <TrendingUp className="h-4 w-4" /> Roles Registrados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del Sistema */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/20 p-8">
        <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" /> Estado del Sistema
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-black/40 p-6">
            <h4 className="mb-2 text-sm font-medium text-neutral-400">Base de Datos (Appwrite)</h4>
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="text-white font-medium">Conectado y Operativo</span>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Sincronización en tiempo real habilitada para Proyectos, Testimonios y Experiencia.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/40 p-6">
            <h4 className="mb-2 text-sm font-medium text-neutral-400">Acciones Recomendadas</h4>
            <ul className="space-y-3">
              {stats.testimonials.pending > 0 ? (
                <li className="flex items-start gap-2 text-sm text-amber-400">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  Tienes {stats.testimonials.pending} testimonio(s) pendiente(s) de revisión en tu bandeja de entrada.
                </li>
              ) : (
                <li className="flex items-start gap-2 text-sm text-neutral-400">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                  Bandeja de testimonios al día.
                </li>
              )}
              {stats.projects.total === 0 && (
                <li className="flex items-start gap-2 text-sm text-neutral-400">
                  <FolderKanban className="h-4 w-4 mt-0.5 shrink-0 text-blue-400" />
                  Añade tu primer proyecto para poblar el portafolio.
                </li>
              )}
              {stats.experience.total === 0 && (
                <li className="flex items-start gap-2 text-sm text-neutral-400">
                  <Briefcase className="h-4 w-4 mt-0.5 shrink-0 text-purple-400" />
                  Configura tu trayectoria laboral en la sección de Experiencia.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}