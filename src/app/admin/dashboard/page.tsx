"use client";

import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, FolderKanban, Wrench, Settings, MessageSquare, Briefcase, BarChart, Loader2 } from "lucide-react";

// ============================================================================
// INSTRUCCIONES PARA TU ENTORNO LOCAL:
// 1. Quita los comentarios (//) de las siguientes líneas de importación.
// 2. Elimina la sección de "MOCKS" que está justo debajo.
// ============================================================================
import AdminOverview from "@/components/AdminOverview";
import AdminProjects from "@/components/AdminProjects";
import AdminTestimonials from "@/components/AdminTestimonials";
import AdminExperience from "@/components/AdminExperience";
import AdminSkills from "@/components/AdminSkills";
import AdminSettings from "@/components/AdminSettings";
import { useRouter } from "next/navigation";
import { account } from "../../../../appwrite";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch (error) {
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
      {/* Sidebar (Menú Lateral) */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-neutral-900/30 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-emerald-500">
            Admin Panel
          </h1>
          <p className="mt-1 text-xs text-neutral-400 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-4">Principal</p>
          <SidebarButton icon={<LayoutDashboard className="h-4 w-4" />} label="Vista General" isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <SidebarButton icon={<BarChart className="h-4 w-4" />} label="Analíticas" isActive={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
          
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-6">Contenido</p>
          <SidebarButton icon={<FolderKanban className="h-4 w-4" />} label="Proyectos" isActive={activeTab === "projects"} onClick={() => setActiveTab("projects")} />
          <SidebarButton icon={<Briefcase className="h-4 w-4" />} label="Experiencia" isActive={activeTab === "experience"} onClick={() => setActiveTab("experience")} />
          <SidebarButton icon={<Wrench className="h-4 w-4" />} label="Habilidades" isActive={activeTab === "skills"} onClick={() => setActiveTab("skills")} />
          
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-6">Interacción</p>
          <SidebarButton icon={<MessageSquare className="h-4 w-4" />} label="Testimonios" isActive={activeTab === "testimonials"} onClick={() => setActiveTab("testimonials")} />
          
          <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-6">Sistema</p>
          <SidebarButton icon={<Settings className="h-4 w-4" />} label="Configuración" isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="mt-8 pt-6 border-t border-white/10">
          <button onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50">
            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-10 overflow-y-auto">
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
          {activeTab === "testimonials" && <AdminTestimonials />}
          {activeTab === "experience" && <AdminExperience />}
          {activeTab === "skills" && <AdminSkills />}
          {activeTab === "settings" && <AdminSettings />}
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