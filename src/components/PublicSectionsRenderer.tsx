"use client";

import { useEffect, useMemo, useState } from "react";
import { Query } from "appwrite";
import Hero from "@/components/Hero";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import ExperienceSection from "@/components/ExperienceSection";
import TestimonialSection from "@/components/TestimonialSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import { databases, APPWRITE_DB_ID, APPWRITE_COLLECTION_SECTIONS_ID } from "../../appwrite";
import { SectionVisibility } from "@/types/appwrite";

type SectionKey = "hero" | "projects" | "skills" | "experience" | "testimonials" | "contact" | "footer";

const DEFAULT_SECTIONS: Array<{ sectionId: SectionKey; name: string; isVisible: boolean; order: number }> = [
  { sectionId: "hero", name: "Hero", isVisible: true, order: 0 },
  { sectionId: "projects", name: "Proyectos", isVisible: true, order: 1 },
  { sectionId: "skills", name: "Sobre Mi y Habilidades", isVisible: true, order: 2 },
  { sectionId: "experience", name: "Experiencia", isVisible: true, order: 3 },
  { sectionId: "testimonials", name: "Testimonios", isVisible: true, order: 4 },
  { sectionId: "contact", name: "Contacto", isVisible: true, order: 5 },
  { sectionId: "footer", name: "Footer", isVisible: true, order: 6 },
];

const SECTION_COMPONENTS: Record<SectionKey, React.ReactNode> = {
  hero: <Hero />,
  projects: <ProjectsSection />,
  skills: <SkillsSection />,
  experience: <ExperienceSection />,
  testimonials: <TestimonialSection />,
  contact: <ContactSection />,
  footer: <FooterSection />,
};

export default function PublicSectionsRenderer() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  useEffect(() => {
    const fetchSectionOrder = async () => {
      if (!APPWRITE_COLLECTION_SECTIONS_ID) return;

      try {
        const res = await databases.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_SECTIONS_ID, [
          Query.orderAsc("order"),
        ]);

        if (res.documents.length === 0) return;

        const mapped = (res.documents as unknown as SectionVisibility[])
          .map((doc) => ({
            sectionId: doc.sectionId as SectionKey,
            name: doc.name,
            isVisible: doc.isVisible,
            order: doc.order,
          }))
          .filter((doc) => doc.sectionId in SECTION_COMPONENTS)
          .sort((a, b) => a.order - b.order);

        if (mapped.length > 0) {
          setSections(mapped);
        }
      } catch (error) {
        console.error("Error cargando el orden de secciones:", error);
      }
    };

    fetchSectionOrder();
  }, []);

  const visibleSections = useMemo(
    () => sections.filter((section) => section.isVisible),
    [sections]
  );

  return (
    <main className="flex min-h-screen flex-col">
      {visibleSections.map((section) => (
        <div key={section.sectionId}>{SECTION_COMPONENTS[section.sectionId]}</div>
      ))}
    </main>
  );
}
