"use client";

import { useState, useEffect } from "react";
import { Loader2, Settings2, Save, UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";

// ============================================================================
// INSTRUCCIONES: Quita comentarios y MOCKS en local.
// ============================================================================
import { databases, storage, APPWRITE_DB_ID } from "../../appwrite";
import { ID } from "appwrite";
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
          const data = res.documents[0] as any;
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

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-3xl border border-white/10 bg-neutral-900/40 rounded-2xl p-8 relative">
      
      {/* NOTIFICACIÓN ELEGANTE DE ÉXITO */}
      {saveStatus === 'success' && (
        <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-medium">Configuración guardada correctamente</p>
        </div>
      )}

      {/* NOTIFICACIÓN DE ERROR */}
      {saveStatus === 'error' && (
        <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <p className="text-sm font-medium">Hubo un error al guardar</p>
        </div>
      )}

      <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-6">
        <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400"><Settings2 className="h-6 w-6" /></div>
        <div>
          <h3 className="text-xl font-bold text-white">Configuración Global</h3>
          <p className="text-sm text-neutral-400">Administra los textos principales y tu foto de perfil.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-black/20 p-6 rounded-xl border border-white/5">
          <h4 className="font-semibold text-emerald-500">Sección Hero (Inicio)</h4>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Título Principal (Tu Nombre o Cargo)</label>
            {/* Ahora este campo actualizará tu Hero */}
            <input required type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="Ej: Alejandro Rodriguez" className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 outline-none font-bold text-lg" />
            <p className="text-xs text-neutral-500 mt-1">Este es el texto grande que aparece apenas entras a la página.</p>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Subtítulo (A qué te dedicas)</label>
            <textarea required value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 outline-none h-20" />
          </div>
        </div>

        <div className="space-y-6 bg-black/20 p-6 rounded-xl border border-white/5">
          <h4 className="font-semibold text-emerald-500">Sección Sobre Mí</h4>
          <div>
            <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Foto de Perfil
            </label>
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 shrink-0 rounded-full border border-white/10 bg-neutral-900 overflow-hidden flex items-center justify-center">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : profileImageUrl ? <img src={profileImageUrl} alt="Current" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-neutral-600" />}
              </div>
              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg border border-dashed border-white/20 bg-black/50 px-6 py-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                  <UploadCloud className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-white">Haz clic para subir una foto</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Biografía / Texto Descriptivo</label>
            <textarea required value={aboutText} onChange={e => setAboutText(e.target.value)} className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-white focus:border-emerald-500 outline-none h-32" />
          </div>
        </div>

        <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 px-8 rounded-lg transition-colors w-full sm:w-auto">
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}