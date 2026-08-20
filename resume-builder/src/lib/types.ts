export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  scoreBefore: number;
  scoreAfter: number;
}

export interface JobFetchResult {
  jobTitle: string;
  company: string;
  description: string;
  source: "linkedin" | "indeed" | "glassdoor" | "generic";
}

export function emptyResumeData(): ResumeData {
  return {
    contact: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };
}
