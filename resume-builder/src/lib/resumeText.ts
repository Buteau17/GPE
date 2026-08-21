import type { ResumeData } from "./types";

export function resumeDataToText(resume: ResumeData): string {
  const parts: string[] = [];
  parts.push(resume.summary);
  parts.push(resume.skills.join(", "));
  for (const job of resume.experience) {
    parts.push(`${job.title} ${job.company}`);
    parts.push(job.bullets.join(" "));
  }
  for (const edu of resume.education) {
    parts.push(`${edu.school} ${edu.degree}`);
  }
  for (const project of resume.projects) {
    parts.push(`${project.name} ${project.tech} ${project.description}`);
  }
  parts.push(resume.certifications.join(", "));
  for (const section of resume.customSections) {
    parts.push(`${section.title} ${section.content}`);
  }
  return parts.join("\n");
}
