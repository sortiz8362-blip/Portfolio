import { 
  SiNextdotjs, 
  SiReact, 
  SiTypescript, 
  SiJavascript, 
  SiTailwindcss, 
  SiNodedotjs, 
 SiExpress, 
 SiMongodb, 
 SiPostgresql, 
 SiFirebase, 
 SiAppwrite, 
 SiGit, 
 SiGithub, 
 SiDocker, 
 SiFigma, 
 SiVercel,
 SiPython,
 SiDjango,
 SiSpringboot,
 SiVuedotjs,
 SiAngular,
 SiHtml5,
 SiCss,
 SiAndroidstudio,
 SiWebstorm,
 SiPostman
} from "react-icons/si";
import { Terminal, Code, Cpu, Database, Layout, Cloud } from "lucide-react";

interface SkillIconProps {
  name: string;
  className?: string;
}

export default function SkillIcon({ name, className = "h-5 w-5" }: SkillIconProps) {
  const n = name.toLowerCase().trim();

  // Mapeo manual para asegurar precisión
  if (n.includes("next.js") || n.includes("nextjs")) return <SiNextdotjs className={className} />;
  if (n === "react" || n.includes("react.js")) return <SiReact className={className} />;
  if (n.includes("typescript")) return <SiTypescript className={className} />;
  if (n.includes("javascript")) return <SiJavascript className={className} />;
  if (n.includes("tailwind")) return <SiTailwindcss className={className} />;
  if (n.includes("node.js") || n.includes("nodejs")) return <SiNodedotjs className={className} />;
  if (n === "express") return <SiExpress className={className} />;
  if (n.includes("mongo")) return <SiMongodb className={className} />;
  if (n.includes("postgres")) return <SiPostgresql className={className} />;
  if (n.includes("firebase")) return <SiFirebase className={className} />;
  if (n.includes("appwrite")) return <SiAppwrite className={className} />;
  if (n === "git") return <SiGit className={className} />;
  if (n === "github") return <SiGithub className={className} />;
  if (n.includes("docker")) return <SiDocker className={className} />;
  if (n.includes("aws") || n.includes("amazon")) return <Cloud className={className} />;
  if (n.includes("figma")) return <SiFigma className={className} />;
  if (n.includes("vercel")) return <SiVercel className={className} />;
  if (n.includes("python")) return <SiPython className={className} />;
  if (n.includes("django")) return <SiDjango className={className} />;
  if (n.includes("spring")) return <SiSpringboot className={className} />;
  if (n.includes("vue")) return <SiVuedotjs className={className} />;
  if (n.includes("angular")) return <SiAngular className={className} />;
  if (n.includes("html")) return <SiHtml5 className={className} />;
  if (n.includes("css")) return <SiCss className={className} />;
  if (n.includes("android studio")) return <SiAndroidstudio className={className} />;
  if (n.includes("webstorm")) return <SiWebstorm className={className} />;
  if (n.includes("postman")) return <SiPostman className={className} />;
  
  // VS Code fallback
  if (n.includes("vscode") || n.includes("visual studio code")) return <Code className={className} />;

  // Iconos por categoría si no hay uno específico
  if (n.includes("frontend")) return <Layout className={className} />;
  if (n.includes("backend")) return <Database className={className} />;
  if (n.includes("devops") || n.includes("tool")) return <Terminal className={className} />;
  if (n.includes("core") || n.includes("logic")) return <Cpu className={className} />;
  
  // Fallback genérico
  return <Code className={className} />;
}
