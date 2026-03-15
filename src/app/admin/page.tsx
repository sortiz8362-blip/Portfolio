"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { account } from "../../../appwrite";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Empezamos en true mientras verificamos
  const router = useRouter();

  // 1. Verificamos si YA estás logueado apenas entras a /admin
  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get(); // Si esto funciona, significa que ya estás logueado
        router.push("/admin/dashboard"); // Te mandamos directo al dashboard
      } catch {
        // Si falla, significa que no estás logueado. Paramos de cargar y mostramos el formulario.
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await account.createEmailPasswordSession(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas o error de conexión.");
      setLoading(false);
    }
  };

  // Si estamos verificando si ya estás logueado, mostramos un spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-neutral-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Panel de Control
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Ingresa tus credenciales para administrar tu portafolio.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="admin@tuportafolio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50"
          >
            Ingresar al Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}