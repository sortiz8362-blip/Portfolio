"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, CheckCircle, XCircle, Pencil, User } from "lucide-react";

// ============================================================================
// INSTRUCCIONES PARA TU ENTORNO LOCAL:
// 1. Quita los comentarios (//) de las siguientes tres líneas.
// 2. Elimina la sección de "MOCKS".
// ============================================================================
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { Testimonial } from "@/types/appwrite";
const APPWRITE_COLLECTION_TESTIMONIALS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TESTIMONIALS_ID || "";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para edición rápida
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_TESTIMONIALS_ID);
      setTestimonials(response.documents as unknown as Testimonial[]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await databases.updateDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_TESTIMONIALS_ID, id, {
        isApproved: !currentStatus
      });
      await fetchTestimonials();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const startEditing = (t: Testimonial) => {
    setEditingId(t.$id);
    setEditMessage(t.message);
  };

  const handleSaveEdit = async (id: string) => {
    setIsSubmitting(true);
    try {
      await databases.updateDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_TESTIMONIALS_ID, id, {
        message: editMessage
      });
      setEditingId(null);
      await fetchTestimonials();
    } catch (error) {
      console.error("Error al editar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar testimonio permanentemente?")) return;
    try {
      await databases.deleteDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_TESTIMONIALS_ID, id);
      await fetchTestimonials();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="admin-neuro-accent animate-spin" /></div>;

  const pending = testimonials.filter(t => !t.isApproved);
  const approved = testimonials.filter(t => t.isApproved);

  return (
    <div className="space-y-12">
      
      {/* Bandeja de Pendientes (Llegan desde la web pública) */}
      <div className="space-y-4">
        <h3 className="admin-neuro-title text-xl font-semibold text-amber-700 flex items-center gap-2">
          Bandeja de Aprobación ({pending.length})
        </h3>
        <p className="admin-neuro-muted text-sm">Nuevos testimonios enviados desde tu portafolio público.</p>
        
        {pending.length === 0 ? (
          <div className="admin-neuro-panel-inset rounded-xl p-8 text-center border border-dashed border-slate-300/70">
            <p className="admin-neuro-muted">No hay testimonios pendientes de revisión.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map(t => (
              <div key={t.$id} className="admin-neuro-panel rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6 border border-amber-300/50">
                <div className="flex-1">
                  <h4 className="admin-neuro-title font-bold flex items-center gap-2"><User className="h-4 w-4"/> {t.name}</h4>
                  <p className="text-xs text-amber-700 mb-3">{t.role}</p>
                  
                  {/* Modo Edición Rápida */}
                  {editingId === t.$id ? (
                    <div className="mt-2 space-y-2">
                      <textarea 
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="admin-neuro-textarea h-24 p-3 text-sm"
                      />
                      <div className="flex gap-2">
                        <button disabled={isSubmitting} onClick={() => handleSaveEdit(t.$id)} className="admin-neuro-btn admin-neuro-btn-primary rounded px-3 py-1.5 text-xs font-bold">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="admin-neuro-btn rounded px-3 py-1.5 text-xs">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <p className="admin-neuro-panel-inset italic p-3 text-sm text-slate-700">&quot;{t.message}&quot;</p>
                      <button onClick={() => startEditing(t)} className="admin-neuro-btn absolute right-2 top-2 p-1.5 opacity-0 transition-opacity group-hover:opacity-100" title="Corregir ortografía">
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end gap-2 md:w-32">
                  <button onClick={() => toggleApproval(t.$id, t.isApproved)} className="admin-neuro-btn admin-neuro-btn-primary flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition">
                    <CheckCircle className="h-4 w-4"/> Aprobar
                  </button>
                  <button onClick={() => handleDelete(t.$id)} className="admin-neuro-btn admin-neuro-btn-danger flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition">
                    <Trash2 className="h-4 w-4"/> Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aprobados (Públicos) */}
      <div className="space-y-4 pt-8 border-t border-slate-300/55">
        <h3 className="admin-neuro-title text-xl font-semibold text-teal-700">Testimonios Públicos ({approved.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approved.map(t => (
             <div key={t.$id} className="admin-neuro-panel rounded-xl p-5 relative group flex flex-col justify-between">
               <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(t.$id)} className="admin-neuro-btn p-1.5 rounded text-red-600" title="Borrar definitivamente"><Trash2 className="h-3 w-3"/></button>
               </div>
               
               <div>
                 <h4 className="admin-neuro-title font-bold text-sm">{t.name}</h4>
                 <p className="text-xs text-teal-700 mb-3">{t.role}</p>
                 <p className="admin-neuro-muted text-sm italic mb-4 line-clamp-4">&quot;{t.message}&quot;</p>
               </div>
               
               <button onClick={() => toggleApproval(t.$id, t.isApproved)} className="mt-auto pt-4 text-xs flex items-center gap-2 admin-neuro-muted hover:text-amber-700 transition border-t border-slate-300/55 w-fit">
                 <XCircle className="h-4 w-4"/> Revocar (Devolver a pendientes)
               </button>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}