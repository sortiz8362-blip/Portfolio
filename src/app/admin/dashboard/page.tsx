"use client";

import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, FolderKanban, Wrench, Settings, MessageSquare, Briefcase, BarChart, Loader2, Menu, X, Mail } from "lucide-react";

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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Menú Lateral) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/10 bg-neutral-900 p-6 flex flex-col transition-transform duration-300 ease-in-out md:relative md:flex md:w-64 md:translate-x-0 md:bg-neutral-900/30
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-500">
              Admin Panel
            </h1>
            <p className="mt-1 text-xs text-neutral-400 truncate max-w-[180px]">{user?.email}</p>
          </div>
          <button 
            className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-4">Principal</p>
          <SidebarButton icon={<LayoutDashboard className="h-4 w-4" />} label="Vista General" isActive={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<BarChart className="h-4 w-4" />} label="Analíticas" isActive={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setIsSidebarOpen(false); }} />
          
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-6">Contenido</p>
          <SidebarButton icon={<FolderKanban className="h-4 w-4" />} label="Proyectos" isActive={activeTab === "projects"} onClick={() => { setActiveTab("projects"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<Briefcase className="h-4 w-4" />} label="Experiencia" isActive={activeTab === "experience"} onClick={() => { setActiveTab("experience"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<Wrench className="h-4 w-4" />} label="Habilidades" isActive={activeTab === "skills"} onClick={() => { setActiveTab("skills"); setIsSidebarOpen(false); }} />
          
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-6">Interacción</p>
          <SidebarButton icon={<Mail className="h-4 w-4" />} label="Mensajes" isActive={activeTab === "messages"} onClick={() => { setActiveTab("messages"); setIsSidebarOpen(false); }} />
          <SidebarButton icon={<MessageSquare className="h-4 w-4" />} label="Testimonios" isActive={activeTab === "testimonials"} onClick={() => { setActiveTab("testimonials"); setIsSidebarOpen(false); }} />
          
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-6">Sistema</p>
          <SidebarButton icon={<Settings className="h-4 w-4" />} label="Configuración" isActive={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }} />
        </nav>

        <div className="mt-8 pt-6 border-t border-white/10">
          <button onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50">
            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-neutral-950/80 px-6 py-4 backdrop-blur-md md:hidden">
          <h1 className="text-lg font-bold text-emerald-500">Admin Panel</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg bg-neutral-900 p-2 text-neutral-400 border border-white/10 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 md:p-10">
          <header className="mb-8">
            <h2 className="text-3xl font-bold capitalize">
              {activeTab === "overview" || activeTab === "analytics" ? "Centro de Mando" : activeTab}
            </h2>
            <p className="mt-2 text-neutral-400">
              Gestiona la sección de <span className="text-emerald-500 font-medium">{activeTab}</span> de tu plataforma.
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
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}