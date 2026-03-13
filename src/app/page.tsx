import Hero from "@/components/Hero";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import FooterSection from "@/components/FooterSection";
import TestimonialSection from "@/components/TestimonialSection";
import ExperienceSection from "@/components/ExperienceSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <ProjectsSection />
      <SkillsSection />
      <ExperienceSection />
      <TestimonialSection />
      <FooterSection />
    </main>
  );
}