"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 60;

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = `rgba(16, 185, 129, ${Math.random() * 0.4 + 0.1})`;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        let dx = mouse.current.x - this.x;
        let dy = mouse.current.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        const maxDistance = 150;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            let dxBase = this.x - this.baseX;
            this.x -= dxBase / 20;
          }
          if (this.y !== this.baseY) {
            let dyBase = this.y - this.baseY;
            this.y -= dyBase / 20;
          }
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.x;
      mouse.current.y = e.y;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // Animación de la cuadrícula (Grid)
    gsap.to(".grid-lines", {
      backgroundPosition: "0 100px",
      duration: 3,
      repeat: -1,
      ease: "none"
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black pointer-events-none">
      {/* Capa de Partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-60 pointer-events-auto"
      />

      {/* Capa de Cuadrícula 3D */}
      <div className="absolute inset-0 perspective-[1000px] pointer-events-none">
        <div 
          className="absolute bottom-0 left-1/2 h-[150%] w-[200%] -translate-x-1/2 translate-y-1/2 rotate-x-[65deg] opacity-20"
          style={{
            transformOrigin: "center center",
          }}
        >
          <div 
            className="grid-lines h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(16, 185, 129, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16, 185, 129, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              maskImage: "linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)",
            }}
          />
        </div>
      </div>

      {/* Glows ambientales de fondo */}
      <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
    </div>
  );
}
