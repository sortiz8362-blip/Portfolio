"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { Home, Briefcase, Code2, Mail, User } from "lucide-react";

// 1. Definimos los elementos del menú
const dockItems = [
  { id: "home", icon: Home, label: "Inicio", href: "/" },
  { id: "about", icon: User, label: "Sobre Mí", href: "/#about" },
  { id: "projects", icon: Briefcase, label: "Proyectos", href: "/#projects" },
  { id: "skills", icon: Code2, label: "Habilidades", href: "/#skills" },
  { id: "contact", icon: Mail, label: "Contacto", href: "/#contact" },
];

export default function Dock() {
  // Rastreamos la posición X del ratón en toda la pantalla
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="site-dock fixed bottom-6 left-1/2 z-50 flex h-16 -translate-x-1/2 items-end gap-4 rounded-2xl px-4 pb-3 backdrop-blur-xl"
    >
      {dockItems.map((item) => (
        <DockIcon key={item.id} mouseX={mouseX} href={item.href} label={item.label}>
          <item.icon className="site-dock-icon-symbol h-full w-full transition-colors" />
        </DockIcon>
      ))}
    </motion.div>
  );
}

// 2. Componente individual del ícono con físicas
function DockIcon({
  mouseX,
  href,
  label,
  children,
}: {
  mouseX: MotionValue<number>;
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Calculamos la distancia desde el ratón hasta el centro de este ícono
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Transformamos esa distancia en tamaño (width). 
  // Rango: de -150px a 150px de distancia, el tamaño varía de 40px a 80px (centro) a 40px.
  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  
  // Añadimos físicas de resorte (spring) para que el movimiento sea líquido y orgánico
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div className="relative group flex items-end justify-center">
      <motion.div
        ref={ref}
        style={{ width, height: width }}
        className="site-dock-icon flex cursor-pointer items-center justify-center rounded-full transition-colors"
      >
        <a href={href} className="flex h-full w-full items-center justify-center p-2.5">
          {children}
        </a>
      </motion.div>
      
      {/* Tooltip moderno que aparece al hacer hover */}
      <span className="site-dock-tooltip pointer-events-none absolute -top-12 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}