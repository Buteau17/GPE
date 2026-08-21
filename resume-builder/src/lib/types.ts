export interface ContactInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  tech: string;
  link: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  customSections: CustomSection[];
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  scoreBefore: number;
  scoreAfter: number;
}

let idCounter = 0;
export function uid(): string {
  idCounter += 1;
  return `id-${Date.now().toString(36)}-${idCounter}`;
}

export function emptyExperience(): ExperienceEntry {
  return { id: uid(), title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] };
}

export function emptyEducation(): EducationEntry {
  return { id: uid(), school: "", degree: "", location: "", startDate: "", endDate: "", details: "" };
}

export function emptyProject(): ProjectEntry {
  return { id: uid(), name: "", tech: "", link: "", description: "" };
}

export function emptyCustomSection(): CustomSection {
  return { id: uid(), title: "", content: "" };
}

export function emptyResumeData(): ResumeData {
  return {
    contact: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    customSections: [],
  };
}
