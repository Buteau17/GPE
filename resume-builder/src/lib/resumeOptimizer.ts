import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, getClaudeClient, hasClaudeKey } from "./anthropic";
import { extractJobKeywords } from "./keywords";
import { RESUME_SCHEMA } from "./structuredResume";
import type { ResumeData } from "./types";

const MAX_BULLETS_PER_ROLE = 5;
const MIN_BULLETS_PER_ROLE = 2;

async function optimizeWithClaude(resume: ResumeData, jobDescription: string): Promise<ResumeData> {
  const client = getClaudeClient();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "You are an expert resume editor who tailors resumes to a specific job posting so they pass " +
      "ATS (Applicant Tracking System) keyword screening and read well to a human recruiter. Rules:\n" +
      "1. Never invent employers, job titles, dates, degrees, or skills that are not already present " +
      "in the source resume. You may rephrase and reorder, never fabricate.\n" +
      "2. Rewrite the summary (2-3 sentences) and reorder the skills list so the terms most relevant " +
      "to the job description come first.\n" +
      "3. Rewrite experience bullets using strong action verbs and, where the source already implies " +
      "them, the exact terminology used in the job description, so long as it stays truthful to the " +
      "original content. Keep at most 5 bullets per role, the most relevant ones.\n" +
      "4. Keep all text plain (no tables, no special unicode bullets, no emoji) since this will be " +
      "parsed by ATS software.\n" +
      "5. Keep the overall content concise enough to fit on a single page.",
    tools: [
      {
        name: "submit_optimized_resume",
        description: "Submit the ATS-optimized resume in structured form.",
        input_schema: RESUME_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "submit_optimized_resume" },
    messages: [
      {
        role: "user",
        content:
          `Job description:\n${jobDescription}\n\n` +
          `Current resume (structured JSON):\n${JSON.stringify(resume, null, 2)}\n\n` +
          "Tailor this resume to the job description following the system rules.",
      },
    ],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) throw new Error("Claude did not return an optimized resume");
  return toolUse.input as ResumeData;
}

function scoreText(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => (lower.includes(kw.toLowerCase()) ? score + 1 : score), 0);
}

function optimizeRuleBased(resume: ResumeData, jobDescription: string): ResumeData {
  const keywords = extractJobKeywords(jobDescription, 40);

  const skills = [...resume.skills].sort((a, b) => scoreText(b, keywords) - scoreText(a, keywords));

  const experience = resume.experience.map((job) => {
    if (job.bullets.length <= MAX_BULLETS_PER_ROLE) return job;
    const ranked = [...job.bullets].sort((a, b) => scoreText(b, keywords) - scoreText(a, keywords));
    const keepCount = Math.max(MIN_BULLETS_PER_ROLE, MAX_BULLETS_PER_ROLE);
    return { ...job, bullets: ranked.slice(0, keepCount) };
  });

  return { ...resume, skills, experience };
}

export async function optimizeResume(
  resume: ResumeData,
  jobDescription: string,
): Promise<{ data: ResumeData; usedAI: boolean }> {
  if (hasClaudeKey()) {
    try {
      const data = await optimizeWithClaude(resume, jobDescription);
      return { data, usedAI: true };
    } catch {
      // Fall through to the rule-based optimizer if the API call fails.
    }
  }
  return { data: optimizeRuleBased(resume, jobDescription), usedAI: false };
}
