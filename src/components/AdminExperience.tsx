"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Pencil, Briefcase, Eye, EyeOff, Building2, Calendar } from "lucide-react";

// ============================================================================
// INSTRUCCIONES: Quita comentarios y MOCKS.
// ============================================================================
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { ID } from "appwrite";
import { Experience } from "@/types/appwrite";
const APPWRITE_COLLECTION_EXPERIENCE_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXPERIENCE_ID || "";

// AQUÍ ESTÁN LAS SUGERENCIAS PREDEFINIDAS
const ROLES_SUGGESTIONS = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "Project Manager", "DevOps Engineer", "Tech Lead", "Freelance", "Desarrollador Web"];
const COMPANY_SUGGESTIONS = ["Freelance", "Trabajo Autónomo", "Agencia Independiente", "Startup", "Google", "Microsoft", "Meta", "Amazon", "Apple"];
const DURATION_SUGGESTIONS = ["2023 - Presente", "2022 - Presente", "2021 - Presente", "2023 - 2024", "Enero 2023 - Diciembre 2023", "Menos de un año"];

export default function AdminExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_EXPERIENCE_ID);
      setExperiences(response.documents as unknown as Experience[]);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const expData = { role, company, duration, description, isVisible };
    try {
      if (editingId) await databases.updateDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_EXPERIENCE_ID, editingId, expData);
      else await databases.createDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_EXPERIENCE_ID, ID.unique(), expData);
      handleCancel();
      await fetchExperience();
    } catch (error) { console.error(error); alert("Error al guardar."); } 
    finally { setIsSubmitting(false); }
  };

  const handleEditClick = (exp: Experience) => {
    setEditingId(exp.$id); setRole(exp.role); setCompany(exp.company); setDuration(exp.duration); setDescription(exp.description); setIsVisible(exp.isVisible);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => { setEditingId(null); setRole(""); setCompany(""); setDuration(""); setDescription(""); setIsVisible(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar esta experiencia definitivamente?")) return;
    try {
      await databases.deleteDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_EXPERIENCE_ID, id);
      await fetchExperience();
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="admin-neuro-accent animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className={`admin-neuro-panel p-6 transition-colors ${editingId ? 'ring-2 ring-emerald-400/35' : ''}`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="admin-neuro-title text-xl font-semibold flex items-center gap-2">
            {editingId ? <><Pencil className="h-5 w-5 text-teal-700" /> Editar Experiencia</> : <><Plus className="h-5 w-5 text-teal-700" /> Añadir Experiencia</>}
          </h3>
          {editingId && <button type="button" onClick={handleCancel} className="admin-neuro-btn rounded-full px-3 py-1 text-sm transition">Cancelar</button>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-neuro-muted mb-1 block text-sm flex items-center gap-1"><Briefcase className="h-4 w-4"/> Cargo / Puesto</label>
              {/* CAMBIO AQUÍ: Añadimos list="roles-list" */}
              <input required type="text" list="roles-list" value={role} onChange={e => setRole(e.target.value)} placeholder="Ej: Full Stack Developer" className="admin-neuro-input p-3" />
              <datalist id="roles-list">
                {ROLES_SUGGESTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="admin-neuro-muted mb-1 block text-sm flex items-center gap-1"><Building2 className="h-4 w-4"/> Empresa</label>
              <input required type="text" list="companies-list" value={company} onChange={e => setCompany(e.target.value)} placeholder="Ej: Google, Freelance..." className="admin-neuro-input p-3" />
              <datalist id="companies-list">
                {COMPANY_SUGGESTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className="admin-neuro-muted mb-1 block text-sm flex items-center gap-1"><Calendar className="h-4 w-4"/> Duración</label>
            <input required type="text" list="durations-list" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ej: Ene 2022 - Presente" className="admin-neuro-input p-3" />
            <datalist id="durations-list">
                {DURATION_SUGGESTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <label className="admin-neuro-muted mb-1 block text-sm">Descripción y Logros</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe tus responsabilidades..." className="admin-neuro-textarea h-24 p-3" />
          </div>
          
          <div className="admin-neuro-panel-inset mb-4 flex w-fit items-center gap-3 p-3">
            <input type="checkbox" id="visibleExp" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
            <label htmlFor="visibleExp" className="text-sm font-medium cursor-pointer flex items-center gap-2 text-slate-700">
              {isVisible ? <Eye className="w-4 h-4 text-teal-700" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              {isVisible ? "Público en el portafolio" : "Oculto (Borrador)"}
            </label>
          </div>
          
          <button disabled={isSubmitting} type="submit" className="admin-neuro-btn admin-neuro-btn-primary px-6 py-3 font-bold disabled:opacity-50">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Actualizar Experiencia" : "Guardar Experiencia"}
          </button>
        </form>
      </div>

      {/* Lista de Experiencia */}
      <div className="space-y-4">
        <h3 className="admin-neuro-title text-xl font-semibold">Trayectoria Registrada ({experiences.length})</h3>
        <div className="grid gap-4">
          {experiences.map((exp) => (
            <div key={exp.$id} className={`admin-neuro-panel group flex flex-col md:flex-row justify-between items-start md:items-center p-5 transition-colors ${exp.isVisible ? '' : 'opacity-70'}`}>
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="admin-neuro-title font-bold text-lg">{exp.role}</h4>
                  {!exp.isVisible && <span className="admin-neuro-chip text-[10px] uppercase tracking-wider px-2 py-1 text-slate-600">Oculto</span>}
                </div>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <span className="text-teal-700 font-medium flex items-center gap-1"><Building2 className="h-3 w-3"/> {exp.company}</span>
                  <span className="admin-neuro-muted flex items-center gap-1"><Calendar className="h-3 w-3"/> {exp.duration}</span>
                </div>
                <p className="admin-neuro-muted line-clamp-2 text-sm md:pr-8">{exp.description}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto justify-end border-t border-slate-300/55 pt-4 md:border-none md:pt-0">
                <button onClick={() => handleEditClick(exp)} className="admin-neuro-btn rounded p-2 text-slate-600 hover:text-teal-700 transition-colors" title="Editar"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(exp.$id)} className="admin-neuro-btn rounded p-2 text-slate-600 hover:text-red-600 transition-colors" title="Borrar"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}