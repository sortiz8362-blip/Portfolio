"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Pencil, LayoutTemplate, Database, Terminal } from "lucide-react";

// ============================================================================
// INSTRUCCIONES: Quita comentarios y MOCKS en local
// ============================================================================
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { ID } from "appwrite";
const APPWRITE_COLLECTION_SKILLS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SKILLS_ID || "";

const CATEGORIES = ["Frontend", "Backend", "Herramientas", "Soft Skills"];
// AQUÍ LA LISTA PARA AUT0COMPLETAR
const SKILLS_SUGGESTIONS = ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Node.js", "Express", "Python", "Django", "Java", "Spring Boot", "MongoDB", "PostgreSQL", "Firebase", "Appwrite", "Git", "GitHub", "Docker", "AWS", "Figma", "Vercel"];



interface Skill {
  $id: string;
  name: string;
  category: string;
  isVisible: boolean;
  percentage?: number;
}

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID);
      setSkills(response.documents as unknown as Skill[]);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = { name, category, isVisible, percentage: Number(percentage) };
      if (editingId) await databases.updateDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID, editingId, data);
      else await databases.createDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID, ID.unique(), data);
      handleCancel();
      await fetchSkills();
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (s: Skill) => {
    setEditingId(s.$id); 
    setName(s.name); 
    setCategory(s.category); 
    setIsVisible(s.isVisible);
    setPercentage(s.percentage || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => { 
    setEditingId(null); 
    setName(""); 
    setCategory(CATEGORIES[0]); 
    setIsVisible(true); 
    setPercentage(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar habilidad?")) return;
    try {
      await databases.deleteDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID, id);
      await fetchSkills();
    } catch (error) { console.error(error); }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === "Frontend") return <LayoutTemplate className="h-4 w-4 text-emerald-400" />;
    if (cat === "Backend") return <Database className="h-4 w-4 text-blue-400" />;
    return <Terminal className="h-4 w-4 text-amber-400" />;
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="admin-neuro-accent animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className={`admin-neuro-panel p-6 transition-colors ${editingId ? 'ring-2 ring-emerald-400/35' : ''}`}>
        <h3 className="admin-neuro-title mb-6 text-xl font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            {editingId ? <Pencil className="h-5 w-5 text-teal-700"/> : <Plus className="h-5 w-5 text-teal-700"/>}
            {editingId ? "Editar Habilidad" : "Añadir Habilidad"}
          </span>
          {editingId && <button onClick={handleCancel} className="admin-neuro-btn rounded-full px-3 py-1 text-sm">Cancelar</button>}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-2 w-full">
              <label className="admin-neuro-muted mb-1 block text-sm">Nombre (Ej: React)</label>
              <input required type="text" list="skills-suggestions-list" value={name} onChange={e => setName(e.target.value)} className="admin-neuro-input p-3" />
              <datalist id="skills-suggestions-list">
                {SKILLS_SUGGESTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div className="flex-1 w-full">
              <label className="admin-neuro-muted mb-1 block text-sm">Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="admin-neuro-select cursor-pointer appearance-none p-3">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="w-full md:w-32">
              <label className="admin-neuro-muted mb-1 block text-sm">Nivel %</label>
              <input 
                required 
                type="number" 
                min="0" 
                max="100" 
                value={percentage} 
                onChange={e => setPercentage(parseInt(e.target.value) || 0)} 
                className="admin-neuro-input p-3" 
              />
            </div>

            <div className="admin-neuro-panel-inset flex h-12.5 items-center gap-2 p-3">
              <input type="checkbox" id="visibleSkill" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
              <label htmlFor="visibleSkill" className="cursor-pointer whitespace-nowrap text-sm text-slate-700">{isVisible ? "Visible" : "Oculto"}</label>
            </div>
            
            <button disabled={isSubmitting} type="submit" className="admin-neuro-btn admin-neuro-btn-primary h-12.5 min-w-30 w-full px-6 font-bold md:w-auto flex items-center justify-center">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Actualizar" : "Añadir"}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map(skill => (
          <div key={skill.$id} className={`admin-neuro-panel flex items-center justify-between p-4 ${skill.isVisible ? '' : 'opacity-60'}`}>
            <div className="flex items-center gap-3">
              <div className="admin-neuro-panel-inset p-2">{getCategoryIcon(skill.category)}</div>
              <div>
                <h4 className="admin-neuro-title font-bold leading-tight">{skill.name}</h4>
                <div className="flex items-center gap-2">
                  <p className="admin-neuro-muted text-xs">{skill.category} {!skill.isVisible && "• Oculto"}</p>
                  <span className="admin-neuro-chip border border-emerald-500/20 px-1.5 py-0.5 text-[10px] text-teal-700">{skill.percentage || 0}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(skill)} className="admin-neuro-btn rounded p-2 text-slate-600 hover:text-teal-700 transition"><Pencil className="h-3 w-3"/></button>
              <button onClick={() => handleDelete(skill.$id)} className="admin-neuro-btn rounded p-2 text-slate-600 hover:text-red-600 transition"><Trash2 className="h-3 w-3"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}