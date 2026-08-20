import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, getClaudeClient, hasClaudeKey } from "./anthropic";
import { heuristicParseResume } from "./heuristicParser";
import { emptyResumeData, type ResumeData } from "./types";

const RESUME_SCHEMA = {
  type: "object" as const,
  properties: {
    contact: {
      type: "object",
      properties: {
        fullName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedin: { type: "string" },
        website: { type: "string" },
      },
      required: ["fullName", "email", "phone", "location", "linkedin", "website"],
    },
    summary: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["title", "company", "location", "startDate", "endDate", "bullets"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          school: { type: "string" },
          degree: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["school", "degree", "location", "startDate", "endDate"],
      },
    },
    certifications: { type: "array", items: { type: "string" } },
  },
  required: ["contact", "summary", "skills", "experience", "education", "certifications"],
};

export { RESUME_SCHEMA };

async function parseResumeWithClaude(rawText: string): Promise<ResumeData> {
  const client = getClaudeClient();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system:
      "You extract structured resume data from raw resume text. Do not invent, embellish, " +
      "or fabricate any information that is not present in the source text. If a field is " +
      "not present, leave it as an empty string or empty array.",
    tools: [
      {
        name: "submit_resume_data",
        description: "Submit the resume parsed into structured fields.",
        input_schema: RESUME_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "submit_resume_data" },
    messages: [
      {
        role: "user",
        content: `Parse the following resume text into structured data:\n\n${rawText}`,
      },
    ],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) throw new Error("Claude did not return structured resume data");
  return toolUse.input as ResumeData;
}

export async function parseResumeText(rawText: string): Promise<{ data: ResumeData; usedAI: boolean }> {
  if (hasClaudeKey()) {
    try {
      const data = await parseResumeWithClaude(rawText);
      return { data, usedAI: true };
    } catch {
      // Fall through to the heuristic parser if the API call fails for any reason.
    }
  }
  const data = heuristicParseResume(rawText) ?? emptyResumeData();
  return { data, usedAI: false };
}
