"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, ExternalLink, Pencil, X, Eye, EyeOff, UploadCloud, ImageIcon } from "lucide-react";

// ============================================================================
// INSTRUCCIONES: Quita comentarios y MOCKS.
// Asegúrate de exportar 'storage' desde tu archivo appwrite.ts
// ============================================================================
import { databases, storage, APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID } from "../../appwrite";
import { ID } from "appwrite";
const APPWRITE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

interface Project {
  $id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  isVisible: boolean;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  
  // Estados para la imagen
  const [imageUrl, setImageUrl] = useState(""); // URL actual si estamos editando
  const [imageFile, setImageFile] = useState<File | null>(null); // Archivo a subir
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Vista previa local

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID);
      setProjects(response.documents as unknown as Project[]);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingId(project.$id);
    setTitle(project.title);
    setDescription(project.description);
    setLink(project.link || "");
    setImageUrl(project.imageUrl); // Guardamos la URL de la imagen existente
    setIsVisible(project.isVisible);
    // Limpiamos la vista previa por si acaso
    setImageFile(null);
    setImagePreview(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null); setTitle(""); setDescription(""); setLink(""); setImageUrl(""); setIsVisible(true);
    setImageFile(null); setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación: Si estamos creando uno nuevo, exigimos que haya seleccionado una imagen.
    if (!editingId && !imageFile) {
      alert("Por favor, selecciona una imagen para el proyecto.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // Si seleccionó un archivo nuevo, lo subimos
      if (imageFile) {
        const uploadedFile = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), imageFile);
        finalImageUrl = storage.getFileView(APPWRITE_BUCKET_ID, uploadedFile.$id);
      }

      const projectData = { title, description, link, imageUrl: finalImageUrl, isVisible };

      if (editingId) {
        await databases.updateDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID, editingId, projectData);
      } else {
        await databases.createDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID, ID.unique(), projectData);
      }
      
      handleCancelEdit();
      await fetchProjects();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el proyecto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar definitivamente?")) return;
    try {
      await databases.deleteDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_PROJECTS_ID, id);
      await fetchProjects();
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-8">
      {/* Formulario */}
      <div className={`rounded-xl border p-6 transition-colors ${editingId ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-neutral-900/50 border-white/10'}`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {editingId ? <><Pencil className="h-5 w-5 text-emerald-400" /> Editando Proyecto</> : <><Plus className="h-5 w-5 text-emerald-500" /> Añadir Nuevo Proyecto</>}
          </h3>
          {editingId && <button onClick={handleCancelEdit} className="text-neutral-400 hover:text-white flex items-center gap-1 text-sm bg-white/5 px-3 py-1 rounded-full"><X className="h-4 w-4" /> Cancelar</button>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Título del Proyecto</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              
              {/* UPLOAD DE IMAGEN DE PROYECTO */}
              <div>
                <label className="block text-sm text-neutral-400 mb-1 flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Imagen del Proyecto</label>
                <div className="relative overflow-hidden rounded-lg border border-dashed border-white/20 bg-black/50 hover:border-emerald-500/50 transition-colors h-32 flex flex-col items-center justify-center cursor-pointer group">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  
                  {imagePreview || imageUrl ? (
                    <img src={imagePreview || imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                  ) : null}
                  
                  <div className="z-0 flex flex-col items-center text-center p-4">
                    <UploadCloud className="h-6 w-6 text-emerald-500 mb-2" />
                    <span className="text-sm font-medium text-white">{imagePreview || imageUrl ? "Haz clic para cambiar imagen" : "Sube una captura del proyecto"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                <label className="block text-sm text-neutral-400 mb-1">Descripción</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 focus:outline-none h-32 resize-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-2 border-t border-white/5">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Enlace al Proyecto (Opcional)</label>
              <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
              <input type="checkbox" id="visibleToggle" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
              <label htmlFor="visibleToggle" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                {isVisible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-neutral-500" />}
                {isVisible ? "Proyecto Público" : "Oculto (Borrador)"}
              </label>
            </div>
          </div>
          
          <button disabled={isSubmitting} type="submit" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto mt-4">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Actualizar Proyecto" : "Crear Proyecto"}
          </button>
        </form>
      </div>

      {/* Lista de Proyectos */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tus Proyectos ({projects.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.$id} className={`group flex flex-col justify-between rounded-xl border p-0 overflow-hidden transition-colors ${project.isVisible ? 'bg-neutral-900/30 border-white/10' : 'bg-neutral-900/10 border-neutral-800 opacity-70'}`}>
              <div className="h-32 w-full relative bg-neutral-950 border-b border-white/5">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-white">{project.title}</h4>
                  {!project.isVisible && <span className="text-[10px] uppercase tracking-wider bg-neutral-800 px-2 py-1 rounded text-neutral-400">Oculto</span>}
                </div>
                <p className="text-sm text-neutral-400 line-clamp-2">{project.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                  {project.link ? (
                    <a href={project.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
                      <ExternalLink className="h-4 w-4" /> Ver url
                    </a>
                  ) : <span />}
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(project)} className="rounded p-2 text-neutral-400 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(project.$id)} className="rounded p-2 text-neutral-400 bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
             <p className="text-neutral-500 col-span-2 text-center py-8">Aún no has creado ningún proyecto.</p>
          )}
        </div>
      </div>
    </div>
  );
}