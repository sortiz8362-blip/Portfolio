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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Bandeja de Entrada</h3>
        <button
          onClick={fetchMessages}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
          <p>{error}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-neutral-900/30 p-12 text-center flex flex-col items-center">
            <Mail className="h-12 w-12 text-neutral-500 mb-4 opacity-50" />
          <p className="text-neutral-400">No hay mensajes todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <div
              key={msg.$id}
              className="group relative flex flex-col gap-4 rounded-xl border border-white/5 bg-neutral-900/30 p-6 shadow-sm transition-all hover:border-emerald-500/30 hover:bg-neutral-900/50"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-500" />
                    {msg.name}
                  </h4>
                  <p className="text-sm text-neutral-400 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {msg.email}
                  </p>
                </div>
                <div className="text-xs text-neutral-500 whitespace-nowrap">
                  {new Date(msg.$createdAt).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              <div className="rounded-lg bg-black/40 p-4 border border-white/5">
                <p className="text-neutral-300 text-sm whitespace-pre-wrap flex gap-3">
                  <MessageSquare className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                  {msg.message}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <a
                  href={`mailto:${msg.email}?subject=Respuesta a tu mensaje en el Portafolio`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 hover:text-black"
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

