"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail, RefreshCw, MessageSquare, User } from "lucide-react";
import { Models } from "appwrite";
import { databases, APPWRITE_DB_ID } from "../../appwrite";

interface MessageDocument extends Models.Document {
  name: string;
  email: string;
  message: string;
}

// ID de la colección (que el usuario debe crear)
const APPWRITE_COLLECTION_MESSAGES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES_ID || "";

export default function AdminMessages() {
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMessages = async () => {
    setIsRefreshing(true);
    setError("");
    
    if (!APPWRITE_COLLECTION_MESSAGES_ID) {
        setError("Falta el ID de la colección de mensajes en las variables de entorno (.env.local)");
        setLoading(false);
        setIsRefreshing(false);
        return;
    }

    try {
      const response = await databases.listDocuments(
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_MESSAGES_ID
      );
      // Ordenar por más recientes primero
      const sortedMessages = (response.documents.sort((a, b) => 
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      ) as unknown) as MessageDocument[];
      setMessages(sortedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Error al cargar los mensajes. Asegúrate de que la colección exista.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="admin-neuro-accent h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="admin-neuro-title text-xl font-semibold">Bandeja de Entrada</h3>
        <button
          onClick={fetchMessages}
          disabled={isRefreshing}
          className="admin-neuro-btn flex items-center gap-2 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-100/70 p-6 text-center text-red-700">
          <p>{error}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="admin-neuro-panel-inset rounded-xl p-12 text-center flex flex-col items-center">
            <Mail className="admin-neuro-muted mb-4 h-12 w-12 opacity-50" />
          <p className="admin-neuro-muted">No hay mensajes todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <div
              key={msg.$id}
              className="admin-neuro-panel group relative flex flex-col gap-4 p-6 shadow-sm transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h4 className="admin-neuro-title font-semibold flex items-center gap-2">
                    <User className="admin-neuro-accent h-4 w-4" />
                    {msg.name}
                  </h4>
                  <p className="admin-neuro-muted mt-1 flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    {msg.email}
                  </p>
                </div>
                <div className="admin-neuro-muted text-xs whitespace-nowrap">
                  {new Date(msg.$createdAt).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              <div className="admin-neuro-panel-inset rounded-lg p-4 border border-slate-300/45">
                <p className="text-slate-700 text-sm whitespace-pre-wrap flex gap-3">
                  <MessageSquare className="admin-neuro-muted h-4 w-4 shrink-0 mt-0.5" />
                  {msg.message}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <a
                  href={`mailto:${msg.email}?subject=Respuesta a tu mensaje en el Portafolio`}
                  className="admin-neuro-btn admin-neuro-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Responder vía Gmail
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

