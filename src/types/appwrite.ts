export interface Project {
  $id: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  isVisible: boolean;
  $createdAt?: string;
}

export interface Testimonial {
  $id: string;
  name: string;
  role: string;
  message: string;
  isApproved: boolean;
  $createdAt?: string;
}

export interface Experience {
  $id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  isVisible: boolean;
  $createdAt?: string;
}

export interface Skill {
  $id: string;
  name: string;
  category: string;
  isVisible: boolean;
  $createdAt?: string;
}

export interface Settings {
  $id: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactEmail: string;
  profileImageUrl: string;
  $createdAt?: string;
}
