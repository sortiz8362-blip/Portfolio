"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

class Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
  glow: number = 0;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;
    this.color = "rgba(16, 185, 129,";
  }

  draw(ctx: CanvasRenderingContext2D) {
    const opacity = (Math.random() * 0.4 + 0.1) + (this.glow * 0.5);
    ctx.fillStyle = `${this.color} ${opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + (this.glow * 2), 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    
    if (this.glow > 0) {
      ctx.shadowBlur = this.glow * 15;
      ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
    } else {
      ctx.shadowBlur = 0;
    }
  }

  update(mouseX: number, mouseY: number, isMoving: boolean) {
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
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
      if (isMoving) this.glow = Math.min(this.glow + 0.1, 1);
    } else {
      if (this.x !== this.baseX) {
        let dxBase = this.x - this.baseX;
        this.x -= dxBase / 20;
      }
      if (this.y !== this.baseY) {
        let dyBase = this.y - this.baseY;
        this.y -= dyBase / 20;
      }
      this.glow = Math.max(this.glow - 0.05, 0);
    }
  }
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, isMoving: false });
  const [mounted, setMounted] = useState(false);
  const lastMouseMove = useRef(Date.now());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 120;

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas));
      }
    };

    const handleResize = () => {
      if (typeof window === "undefined") return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.x;
      mouse.current.y = e.y;
      mouse.current.isMoving = true;
      lastMouseMove.current = Date.now();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();

    const animate = () => {
      if (Date.now() - lastMouseMove.current > 100) {
        mouse.current.isMoving = false;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw(ctx);
        particles[i].update(mouse.current.x, mouse.current.y, mouse.current.isMoving);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const ctx = gsap.context(() => {
        gsap.to(".grid-lines", {
            backgroundPosition: "0 100px",
            duration: 3,
            repeat: -1,
            ease: "none"
        });
    });
    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return <div className="fixed inset-0 bg-black -z-10" />;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black pointer-events-none" suppressHydrationWarning>
      {/* Capa de Partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-80 pointer-events-auto"
      />

      {/* Capa de Cuadrícula 3D */}
      <div className="absolute inset-0 perspective-[1000px] pointer-events-none">
        <div 
          className="absolute bottom-[-20%] left-1/2 h-[150%] w-[250%] -translate-x-1/2 rotate-x-[65deg] opacity-50"
          style={{
            transformOrigin: "center bottom",
          }}
        >
          <div 
            className="grid-lines h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(16, 185, 129, 0.4) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16, 185, 129, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: "90px 90px",
              maskImage: "linear-gradient(to top, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(to top, transparent, black 10%, black 90%, transparent)",
            }}
          />
        </div>
      </div>

      {/* Glows ambientales de fondo */}
      <div className="absolute top-[-10%] left-[-10%] h-[70%] w-[70%] rounded-full bg-emerald-500/[0.08] blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[70%] w-[70%] rounded-full bg-blue-500/[0.08] blur-[140px]" />
    </div>
  );
}
