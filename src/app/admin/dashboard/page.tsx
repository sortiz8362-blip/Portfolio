"use client";

import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, FolderKanban, Wrench, Settings, MessageSquare, Briefcase, BarChart, Loader2, Menu, X, Mail, Moon, Sun } from "lucide-react";

import AdminOverview from "@/components/AdminOverview";
import AdminProjects from "@/components/AdminProjects";
import AdminTestimonials from "@/components/AdminTestimonials";
import AdminExperience from "@/components/AdminExperience";
import AdminSkills from "@/components/AdminSkills";
import AdminSettings from "@/components/AdminSettings";
import AdminMessages from "@/components/AdminMessages";
import { useRouter } from "next/navigation";
import { account } from "../../../../appwrite";
import { Models } from "appwrite";

type AdminTheme = "light" | "dark";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<AdminTheme>("light");

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await account.deleteSession("current");
      router.push("/admin");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-neuro flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin admin-neuro-accent" />
      </div>
    );
  }

  return (
    <div className="admin-neuro flex min-h-screen">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Menú Lateral) */}
      <aside className={`
        admin-neuro-panel fixed inset-y-0 left-0 z-50 m-3 w-72 transform p-6 flex flex-col transition-transform duration-300 ease-in-out md:relative md:m-4 md:flex md:w-64 md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="admin-neuro-title text-xl font-bold tracking-tight">
              Admin Panel
            </h1>
            <p className="admin-neuro-muted mt-1 max-w-45 truncate text-xs">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className="admin-neuro-btn p-2"
              aria-label={theme === "light" ? "Activar tema oscuro" : "Activar tema claro"}
              title={theme === "light" ? "Cambiar a oscuro" : "Cambiar a claro"}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button 
              className="admin-neuro-btn p-2 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="admin-neuro-muted mb-2 mt-4 px-4 text-xs font-semibold uppercase tracking-wider">Principal</p>
          <SidebarButton icon={<LayoutDashboard className="h-4 w-4" />} label="Vista General" isActive={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<BarChart className="h-4 w-4" />} label="Analíticas" isActive={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setIsSidebarOpen(false); }} />
          
          <p className="admin-neuro-muted mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider">Contenido</p>
          <SidebarButton icon={<FolderKanban className="h-4 w-4" />} label="Proyectos" isActive={activeTab === "projects"} onClick={() => { setActiveTab("projects"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<Briefcase className="h-4 w-4" />} label="Experiencia" isActive={activeTab === "experience"} onClick={() => { setActiveTab("experience"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<Wrench className="h-4 w-4" />} label="Habilidades" isActive={activeTab === "skills"} onClick={() => { setActiveTab("skills"); setIsSidebarOpen(false); }} />
          
          <p className="admin-neuro-muted mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider">Interacción</p>
          <SidebarButton icon={<Mail className="h-4 w-4" />} label="Mensajes" isActive={activeTab === "messages"} onClick={() => { setActiveTab("messages"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<MessageSquare className="h-4 w-4" />} label="Testimonios" isActive={activeTab === "testimonials"} onClick={() => { setActiveTab("testimonials"); setIsSidebarOpen(false); }} />
          
          <p className="admin-neuro-muted mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider">Sistema</p>
          <SidebarButton icon={<Settings className="h-4 w-4" />} label="Configuración" isActive={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }} />
        </nav>

        <div className="mt-8 border-t border-slate-400/30 pt-6">
          <button onClick={handleLogout} disabled={isLoggingOut} className="admin-neuro-btn admin-neuro-btn-danger flex w-full items-center gap-3 px-4 py-2 text-sm font-medium disabled:opacity-50">
            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="mx-3 mt-3 flex items-center justify-between rounded-2xl border border-white/70 bg-slate-100/70 px-6 py-4 shadow-[4px_4px_10px_#c4cad5,-4px_-4px_10px_#f8fbff] backdrop-blur-md md:hidden">
          <h1 className="admin-neuro-title text-lg font-bold">Admin Panel</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="admin-neuro-btn p-2"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 md:p-10">
          <header className="admin-neuro-panel mb-8 p-6">
            <h2 className="admin-neuro-title text-3xl font-bold capitalize">
              {activeTab === "overview" || activeTab === "analytics" ? "Centro de Mando" : activeTab}
            </h2>
            <p className="admin-neuro-muted mt-2">
              Gestiona la sección de <span className="admin-neuro-accent font-medium">{activeTab}</span> de tu plataforma.
            </p>
          </header>

          <div className="mt-6">
            {/* Enrutamiento de componentes */}
            {(activeTab === "overview" || activeTab === "analytics") && <AdminOverview />}
            {activeTab === "projects" && <AdminProjects />}
            {activeTab === "messages" && <AdminMessages />}
            {activeTab === "testimonials" && <AdminTestimonials />}
            {activeTab === "experience" && <AdminExperience />}
            {activeTab === "skills" && <AdminSkills />}
            {activeTab === "settings" && <AdminSettings />}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? "admin-neuro-chip text-teal-700"
          : "text-slate-600 hover:bg-slate-200/40 border border-transparent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}