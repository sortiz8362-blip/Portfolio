"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Pencil, Wrench, Eye, EyeOff, LayoutTemplate, Database, Terminal } from "lucide-react";

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
}

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isVisible, setIsVisible] = useState(true);

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
      if (editingId) await databases.updateDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID, editingId, { name, category, isVisible });
      else await databases.createDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_SKILLS_ID, ID.unique(), { name, category, isVisible });
      handleCancel();
      await fetchSkills();
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (s: Skill) => {
    setEditingId(s.$id); setName(s.name); setCategory(s.category); setIsVisible(s.isVisible);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => { setEditingId(null); setName(""); setCategory(CATEGORIES[0]); setIsVisible(true); };

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

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-8">
      <div className={`rounded-xl border p-6 transition-colors ${editingId ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-neutral-900/50 border-white/10'}`}>
        <h3 className="mb-6 text-xl font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            {editingId ? <Pencil className="h-5 w-5 text-emerald-400"/> : <Plus className="h-5 w-5 text-emerald-500"/>}
            {editingId ? "Editar Habilidad" : "Añadir Habilidad"}
          </span>
          {editingId && <button onClick={handleCancel} className="text-sm text-neutral-400 hover:text-white bg-white/5 px-3 py-1 rounded-full">Cancelar</button>}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm text-neutral-400 mb-1">Nombre (Ej: React)</label>
            <input required type="text" list="skills-suggestions-list" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 focus:outline-none" />
            <datalist id="skills-suggestions-list">
              {SKILLS_SUGGESTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm text-neutral-400 mb-1">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-white/5 h-[50px]">
            <input type="checkbox" id="visibleSkill" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="w-4 h-4 accent-emerald-500 cursor-pointer" />
            <label htmlFor="visibleSkill" className="text-sm cursor-pointer whitespace-nowrap">{isVisible ? "Visible" : "Oculto"}</label>
          </div>
          
          <button disabled={isSubmitting} type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-[50px] px-6 rounded-lg transition-colors w-full md:w-auto flex items-center justify-center">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Actualizar" : "Añadir"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map(skill => (
          <div key={skill.$id} className={`flex items-center justify-between p-4 rounded-xl border ${skill.isVisible ? 'bg-neutral-900/30 border-white/10' : 'bg-neutral-900/10 border-neutral-800 opacity-60'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/50 rounded-lg border border-white/5">{getCategoryIcon(skill.category)}</div>
              <div>
                <h4 className="font-bold text-white leading-tight">{skill.name}</h4>
                <p className="text-xs text-neutral-500">{skill.category} {!skill.isVisible && "• Oculto"}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(skill)} className="p-2 text-neutral-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 rounded transition"><Pencil className="h-3 w-3"/></button>
              <button onClick={() => handleDelete(skill.$id)} className="p-2 text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded transition"><Trash2 className="h-3 w-3"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}