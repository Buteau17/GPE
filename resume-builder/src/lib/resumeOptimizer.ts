import { extractJobKeywords } from "./keywords";
import type { ResumeData } from "./types";

const MAX_BULLETS_PER_ROLE = 5;

function scoreText(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => (lower.includes(kw.toLowerCase()) ? score + 1 : score), 0);
}

export function optimizeResume(resume: ResumeData, jobDescription: string): ResumeData {
  const keywords = extractJobKeywords(jobDescription, 40);

  const experience = resume.experience.map((job) => {
    if (job.bullets.length <= MAX_BULLETS_PER_ROLE) return job;
    const ranked = [...job.bullets].sort((a, b) => scoreText(b, keywords) - scoreText(a, keywords));
    return { ...job, bullets: ranked.slice(0, MAX_BULLETS_PER_ROLE) };
  });

  return { ...resume, experience };
}
