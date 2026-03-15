"use client";

import { useState, useEffect } from "react";
import { Loader2, FolderKanban, MessageSquare, Briefcase, TrendingUp, Activity, CheckCircle, Clock } from "lucide-react";

// ============================================================================
// INSTRUCCIONES:
// 1. Quita los comentarios (//) de las siguientes tres líneas.
// 2. Elimina la sección de "MOCKS".
// ============================================================================
import { databases, APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID } from "../../appwrite";
import { Project, Testimonial } from "@/types/appwrite";
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

        const projects = projectsRes.documents as unknown as Project[];
        const testimonials = testimonialsRes.documents as unknown as Testimonial[];
        const experience = experienceRes.total;

        setStats({
          projects: {
            total: projects.length,
            public: projects.filter((p) => p.isVisible).length,
            draft: projects.filter((p) => !p.isVisible).length,
          },
          testimonials: {
            total: testimonials.length,
            approved: testimonials.filter((t) => t.isApproved).length,
            pending: testimonials.filter((t) => !t.isApproved).length,
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
        <Loader2 className="admin-neuro-accent h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Tarjetas Principales (KPIs) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Proyectos */}
        <div className="admin-neuro-panel relative overflow-hidden p-6 transition-all">
          <div className="absolute -right-6 -top-6 text-slate-400/25">
            <FolderKanban className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="admin-neuro-muted font-medium">Proyectos Totales</h3>
              <div className="admin-neuro-chip rounded-md p-2 text-teal-700">
                <FolderKanban className="h-5 w-5" />
              </div>
            </div>
            <p className="admin-neuro-title text-4xl font-bold">{stats.projects.total}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-teal-700">
                <CheckCircle className="h-4 w-4" /> {stats.projects.public} Públicos
              </span>
              <span className="admin-neuro-muted flex items-center gap-1">
                <Activity className="h-4 w-4" /> {stats.projects.draft} Ocultos
              </span>
            </div>
          </div>
        </div>

        {/* Testimonios */}
        <div className="admin-neuro-panel relative overflow-hidden p-6 transition-all">
          <div className="absolute -right-6 -top-6 text-slate-400/25">
            <MessageSquare className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="admin-neuro-muted font-medium">Testimonios</h3>
              <div className="admin-neuro-chip rounded-md p-2 text-amber-700">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <p className="admin-neuro-title text-4xl font-bold">{stats.testimonials.total}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-teal-700">
                <CheckCircle className="h-4 w-4" /> {stats.testimonials.approved} Aprobados
              </span>
              <span className={`flex items-center gap-1 ${stats.testimonials.pending > 0 ? 'text-amber-700 font-medium' : 'admin-neuro-muted'}`}>
                <Clock className="h-4 w-4" /> {stats.testimonials.pending} Pendientes
              </span>
            </div>
          </div>
        </div>

        {/* Experiencia */}
        <div className="admin-neuro-panel relative overflow-hidden p-6 transition-all">
          <div className="absolute -right-6 -top-6 text-slate-400/25">
            <Briefcase className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="admin-neuro-muted font-medium">Trayectoria</h3>
              <div className="admin-neuro-chip rounded-md p-2 text-blue-700">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <p className="admin-neuro-title text-4xl font-bold">{stats.experience.total}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-blue-700">
                <TrendingUp className="h-4 w-4" /> Roles Registrados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del Sistema */}
      <div className="admin-neuro-panel p-8">
        <h3 className="admin-neuro-title mb-6 flex items-center gap-2 text-xl font-bold">
          <Activity className="admin-neuro-accent h-5 w-5" /> Estado del Sistema
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="admin-neuro-panel-inset p-6">
            <h4 className="admin-neuro-muted mb-2 text-sm font-medium">Base de Datos (Appwrite)</h4>
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="font-medium text-slate-800">Conectado y Operativo</span>
            </div>
            <p className="admin-neuro-muted mt-4 text-xs">
              Sincronización en tiempo real habilitada para Proyectos, Testimonios y Experiencia.
            </p>
          </div>

          <div className="admin-neuro-panel-inset p-6">
            <h4 className="admin-neuro-muted mb-2 text-sm font-medium">Acciones Recomendadas</h4>
            <ul className="space-y-3">
              {stats.testimonials.pending > 0 ? (
                <li className="flex items-start gap-2 text-sm text-amber-700">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  Tienes {stats.testimonials.pending} testimonio(s) pendiente(s) de revisión en tu bandeja de entrada.
                </li>
              ) : (
                <li className="admin-neuro-muted flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Bandeja de testimonios al día.
                </li>
              )}
              {stats.projects.total === 0 && (
                <li className="admin-neuro-muted flex items-start gap-2 text-sm">
                  <FolderKanban className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  Añade tu primer proyecto para poblar el portafolio.
                </li>
              )}
              {stats.experience.total === 0 && (
                <li className="admin-neuro-muted flex items-start gap-2 text-sm">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" />
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