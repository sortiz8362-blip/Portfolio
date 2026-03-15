"use client";

import { useState, useEffect } from "react";
import { Loader2, Settings2, Save, UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";

// ============================================================================
// INSTRUCCIONES: Quita comentarios y MOCKS en local.
// ============================================================================
import { databases, storage, APPWRITE_DB_ID } from "../../appwrite";
import { ID } from "appwrite";
import { Settings } from "@/types/appwrite";
const APPWRITE_COLLECTION_SETTINGS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS_ID || "";
const APPWRITE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  
  // Nuevo estado para el mensaje de éxito
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Estados
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SETTINGS_ID);
        if (res.documents.length > 0) {
          const data = res.documents[0] as unknown as Settings;
          setSettingsId(data.$id);
          setHeroTitle(data.heroTitle);
          setHeroSubtitle(data.heroSubtitle);
          setAboutText(data.aboutText);
          setContactEmail(data.contactEmail);
          setProfileImageUrl(data.profileImageUrl || "");
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveStatus('idle');
    
    try {
      let finalImageUrl = profileImageUrl;
      if (imageFile) {
        const uploadedFile = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), imageFile);
        finalImageUrl = storage.getFileView(APPWRITE_BUCKET_ID, uploadedFile.$id);
      }

      const data = { heroTitle, heroSubtitle, aboutText, contactEmail, profileImageUrl: finalImageUrl };
      
      if (settingsId) {
        await databases.updateDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_SETTINGS_ID, settingsId, data);
      } else {
        const res = await databases.createDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_SETTINGS_ID, ID.unique(), data);
        setSettingsId(res.$id);
      }
      
      setImageFile(null);
      setImagePreview(null);
      setProfileImageUrl(finalImageUrl);
      
      // Mostrar mensaje de éxito en lugar del alert()
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 4000); // Se oculta después de 4 segundos

    } catch (error) { 
      console.error(error); 
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="admin-neuro-accent animate-spin" /></div>;

  return (
    <div className="admin-neuro-panel relative max-w-3xl p-8">
      
      {/* NOTIFICACIÓN ELEGANTE DE ÉXITO */}
      {saveStatus === 'success' && (
        <div className="absolute right-4 top-4 rounded-xl border border-emerald-300/50 bg-emerald-100/90 px-4 py-3 text-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-medium">Configuración guardada correctamente</p>
        </div>
      )}

      {/* NOTIFICACIÓN DE ERROR */}
      {saveStatus === 'error' && (
        <div className="absolute right-4 top-4 rounded-xl border border-red-300/50 bg-red-100/90 px-4 py-3 text-red-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <p className="text-sm font-medium">Hubo un error al guardar</p>
        </div>
      )}

      <div className="mb-8 flex items-center gap-3 border-b border-slate-300/60 pb-6">
        <div className="admin-neuro-chip p-3 text-teal-700"><Settings2 className="h-6 w-6" /></div>
        <div>
          <h3 className="admin-neuro-title text-xl font-bold">Configuración Global</h3>
          <p className="admin-neuro-muted text-sm">Administra los textos principales y tu foto de perfil.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-neuro-panel-inset space-y-4 p-6 rounded-xl">
          <h4 className="font-semibold text-teal-700">Sección Hero (Inicio)</h4>
          <div>
            <label className="admin-neuro-muted mb-1 block text-sm">Título Principal (Tu Nombre o Cargo)</label>
            {/* Ahora este campo actualizará tu Hero */}
            <input required type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="Ej: Alejandro Rodriguez" className="admin-neuro-input p-3 font-bold text-lg" />
            <p className="admin-neuro-muted mt-1 text-xs">Este es el texto grande que aparece apenas entras a la página.</p>
          </div>
          <div>
            <label className="admin-neuro-muted mb-1 block text-sm">Subtítulo (A qué te dedicas)</label>
            <textarea required value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} className="admin-neuro-textarea h-20 p-3" />
          </div>
        </div>

        <div className="admin-neuro-panel-inset space-y-6 p-6 rounded-xl">
          <h4 className="font-semibold text-teal-700">Sección Sobre Mí</h4>
          <div>
            <label className="admin-neuro-muted mb-2 flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4" /> Foto de Perfil
            </label>
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 shrink-0 rounded-full border border-white/80 bg-slate-300/70 overflow-hidden flex items-center justify-center shadow-[inset_6px_6px_12px_#b7bdc8,inset_-6px_-6px_12px_#f8fcff]">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : profileImageUrl ? <img src={profileImageUrl} alt="Current" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-slate-500" />}
              </div>
              <div className="flex-1">
                <label className="admin-neuro-panel-inset flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300/80 px-6 py-4 transition-all">
                  <UploadCloud className="admin-neuro-accent h-5 w-5" />
                  <span className="text-sm font-medium text-slate-700">Haz clic para subir una foto</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="admin-neuro-muted mb-1 block text-sm">Biografía / Texto Descriptivo</label>
            <textarea required value={aboutText} onChange={e => setAboutText(e.target.value)} className="admin-neuro-textarea h-32 p-3" />
          </div>
        </div>

        <button disabled={isSubmitting} type="submit" className="admin-neuro-btn admin-neuro-btn-primary flex w-full items-center gap-2 px-8 py-3 font-bold sm:w-auto">
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}