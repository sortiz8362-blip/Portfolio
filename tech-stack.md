# Tech Stack & Architecture Document

Este documento detalla la elección de tecnologías modernas y la arquitectura implementada para alcanzar los requisitos de alto impacto ("Awwwards level") y gestión escalable a través de un enfoque "Headless CMS".

## 1. Stack Tecnológico Core

- **Framework**: Next.js (App Router, React 19*) -> Proveedor principal para frontend y dashboard.
- **Lenguaje**: TypeScript -> Tipado estricto para toda la lógica e integraciones con backend.
- **Estilos**: Tailwind CSS v4 -> Para estilización atómica ultrarrápida y diseño adaptativo.
- **Backend / BaaS**: Appwrite -> Bases de datos (Headless CMS), Autenticación de Admin, Servidor de assets (Storage).
- **Despliegue**: Vercel -> Edge rendering, Serverless functions y CI/CD nativo.

## 2. Librerías de Visualización y Experiencia (Frontend)

- **Animación Base**: GSAP (GreenSock) + ScrollTrigger -> Las animaciones más performantes y fluidas bajo demanda.
- **Micro-interacciones**: Framer Motion -> Elementos reactivos en interfaces y pequeños detalles interactivos (menús expandibles).
- **Smooth Scrolling**: Lenis (`@studio-freight/lenis`) -> Imprescindible para paralajes fluidos y secuencias GSAP al scrollear.
- **WebGL / 3D**: Three.js y React Three Fiber (`@react-three/fiber`, `@react-three/drei`) -> Implementación del fondo interactivo de cristal líquido (liquid glass base).
- **Iconografía**: Lucide React -> Iconos limpios, personalizables y de poco peso.
- **Utilidades de clases CSS**: `clsx` y `tailwind-merge` -> Permite combinar clases dinámicas (Tailwind + variaciones) de forma inteligente en componentes.

## 3. Arquitectura Headless CMS (Control Total)

El Frontend no posee datos duros ("hardcoded"). Toda la información que moldea los componentes de la interfaz provendrá de consultas a **Appwrite Databases**. 
Este enfoque es clave para manejar desde el administrador los siguientes módulos:
- **Visibilidad Global**: Cada sección y componente pesado puede leer un campo `is_visible` para montarse o no en el DOM.
- **Contenidos Dinámicos**: Textos del Hero, listado de habilidades y configuración de URLs dinámicas (Redes Sociales).
- **Modificación de Orden**: Usando campos `order`, el Dashboard permite cambiar el peso de cada componente sin tocar una línea de código del Frontend.

## 4. Progreso de la Inicialización (A día de hoy)

- [x] Especificación técnica de tecnologías redactada y confirmada.
- [x] Esquema lógico (JSON) de la base de datos de Appwrite definido (`appwrite-schema.json`).
- [x] Ejecución de inicialización de framework (`npx create-next-app`).
- [x] Estructura base de carpetas creada.
- [x] Instalación de dependencias complejas de animación y 3D.
- [x] Configuración del Layout (`layout.tsx`) para la envoltura global del scroll suave (Lenis).
- [x] Integración inicial del Dock de macOS.
