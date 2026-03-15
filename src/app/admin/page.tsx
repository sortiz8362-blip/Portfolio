"use client";

import { useState, useEffect } from "react";
import { Loader2, Moon, Sun } from "lucide-react";
import { account } from "../../../appwrite";
import { useRouter } from "next/navigation";

type AdminTheme = "light" | "dark";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Empezamos en true mientras verificamos
  const [theme, setTheme] = useState<AdminTheme>("light");
  const router = useRouter();

  useEffect(() => {
    const storedTheme = localStorage.getItem("admin-theme") as AdminTheme | null;
    const nextTheme = storedTheme
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-admin-theme", theme);
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

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
      <div className="admin-neuro flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin admin-neuro-accent" />
      </div>
    );
  }

  return (
    <div className="admin-neuro flex min-h-screen items-center justify-center px-4">
      <div className="admin-neuro-panel relative w-full max-w-md space-y-8 p-8">
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          className="admin-neuro-btn absolute right-5 top-5 p-2"
          aria-label={theme === "light" ? "Activar tema oscuro" : "Activar tema claro"}
          title={theme === "light" ? "Cambiar a oscuro" : "Cambiar a claro"}
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <div className="text-center">
          <h2 className="admin-neuro-title text-3xl font-bold tracking-tight">
            Panel de Control
          </h2>
          <p className="admin-neuro-muted mt-2 text-sm">
            Ingresa tus credenciales para administrar tu portafolio.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="admin-neuro-muted block text-sm font-medium">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="admin-neuro-input mt-1 block px-4 py-3"
                placeholder="admin@tuportafolio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-neuro-muted block text-sm font-medium">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="admin-neuro-input mt-1 block px-4 py-3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-300/40 bg-red-100/70 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-neuro-btn admin-neuro-btn-primary flex w-full justify-center px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Ingresar al Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}