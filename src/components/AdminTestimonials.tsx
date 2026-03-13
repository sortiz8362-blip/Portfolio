"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, CheckCircle, XCircle, Pencil, User, X } from "lucide-react";

// ============================================================================
// INSTRUCCIONES PARA TU ENTORNO LOCAL:
// 1. Quita los comentarios (//) de las siguientes tres líneas.
// 2. Elimina la sección de "MOCKS".
// ============================================================================
import { databases, APPWRITE_DB_ID } from "../../appwrite";
import { ID } from "appwrite";
const APPWRITE_COLLECTION_TESTIMONIALS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TESTIMONIALS_ID || "";

interface Testimonial {
  $id: string;
  name: string;
  role: string;
  message: string;
  isApproved: boolean;
}

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

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>;

  const pending = testimonials.filter(t => !t.isApproved);
  const approved = testimonials.filter(t => t.isApproved);

  return (
    <div className="space-y-12">
      
      {/* Bandeja de Pendientes (Llegan desde la web pública) */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-amber-500 flex items-center gap-2">
          Bandeja de Aprobación ({pending.length})
        </h3>
        <p className="text-sm text-neutral-400">Nuevos testimonios enviados desde tu portafolio público.</p>
        
        {pending.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-neutral-900/20">
            <p className="text-neutral-500">No hay testimonios pendientes de revisión.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map(t => (
              <div key={t.$id} className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <h4 className="font-bold text-white flex items-center gap-2"><User className="h-4 w-4"/> {t.name}</h4>
                  <p className="text-xs text-amber-500 mb-3">{t.role}</p>
                  
                  {/* Modo Edición Rápida */}
                  {editingId === t.$id ? (
                    <div className="mt-2 space-y-2">
                      <textarea 
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none h-24"
                      />
                      <div className="flex gap-2">
                        <button disabled={isSubmitting} onClick={() => handleSaveEdit(t.$id)} className="text-xs bg-emerald-500 text-black px-3 py-1.5 rounded font-bold hover:bg-emerald-600">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="text-xs bg-neutral-800 text-white px-3 py-1.5 rounded hover:bg-neutral-700">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <p className="text-sm text-neutral-300 italic bg-black/20 p-3 rounded-lg border border-white/5">"{t.message}"</p>
                      <button onClick={() => startEditing(t)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-neutral-400 p-1.5 rounded hover:text-white" title="Corregir ortografía">
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end gap-2 md:w-32">
                  <button onClick={() => toggleApproval(t.$id, t.isApproved)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2.5 rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500/40 transition">
                    <CheckCircle className="h-4 w-4"/> Aprobar
                  </button>
                  <button onClick={() => handleDelete(t.$id)} className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition">
                    <Trash2 className="h-4 w-4"/> Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aprobados (Públicos) */}
      <div className="space-y-4 pt-8 border-t border-white/10">
        <h3 className="text-xl font-semibold text-emerald-500">Testimonios Públicos ({approved.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approved.map(t => (
             <div key={t.$id} className="border border-white/10 bg-neutral-900/30 rounded-xl p-5 relative group flex flex-col justify-between">
               <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(t.$id)} className="text-red-400 hover:text-red-300 bg-black/50 p-1.5 rounded" title="Borrar definitivamente"><Trash2 className="h-3 w-3"/></button>
               </div>
               
               <div>
                 <h4 className="font-bold text-white text-sm">{t.name}</h4>
                 <p className="text-xs text-emerald-500 mb-3">{t.role}</p>
                 <p className="text-sm text-neutral-400 italic mb-4 line-clamp-4">"{t.message}"</p>
               </div>
               
               <button onClick={() => toggleApproval(t.$id, t.isApproved)} className="mt-auto pt-4 text-xs flex items-center gap-2 text-neutral-500 hover:text-amber-500 transition border-t border-white/5 w-fit">
                 <XCircle className="h-4 w-4"/> Revocar (Devolver a pendientes)
               </button>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}