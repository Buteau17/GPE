import { emptyResumeData, uid, type ResumeData } from "./types";

const SECTION_HEADERS: Record<string, keyof ResumeData | "skip"> = {
  summary: "summary",
  "professional summary": "summary",
  "career summary": "summary",
  objective: "summary",
  profile: "summary",
  about: "summary",
  skills: "skills",
  "technical skills": "skills",
  "core competencies": "skills",
  "core skills": "skills",
  experience: "experience",
  "work experience": "experience",
  "professional experience": "experience",
  "employment history": "experience",
  education: "education",
  projects: "projects",
  "personal projects": "projects",
  "side projects": "projects",
  certifications: "certifications",
  certificates: "certifications",
  licenses: "certifications",
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\(?\d[\d\s().-]{7,}\d)/;
const LINKEDIN_RE = /(linkedin\.com\/[^\s,)]+)/i;
const GITHUB_RE = /(github\.com\/[^\s,)]+)/i;
const URL_RE = /(https?:\/\/[^\s,)]+|(?:www\.)?[a-z0-9-]+\.(?:com|dev|io|net|org)[^\s,)]*)/i;
const DATE_RANGE_RE =
  /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4})\s*[-–—]\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4}|present|current)/i;

function normalizeHeader(line: string): keyof ResumeData | "skip" | null {
  const key = line
    .trim()
    .toLowerCase()
    .replace(/[:•]/g, "")
    .trim();
  if (key in SECTION_HEADERS) return SECTION_HEADERS[key];
  return null;
}

function looksLikeHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 40) return false;
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  if (!letters) return false;
  const isAllCaps = letters === letters.toUpperCase() && letters.length > 2;
  const isKnownHeader = normalizeHeader(trimmed) !== null;
  return isAllCaps || isKnownHeader;
}

function splitBullets(block: string[]): string[] {
  const bullets: string[] = [];
  for (const raw of block) {
    const line = raw.replace(/^[-•*▪●◦‣\s]+/, "").trim();
    if (line) bullets.push(line);
  }
  return bullets;
}

function newEntry(): ResumeData["experience"][number] {
  return { id: uid(), title: "", company: "", location: "", startDate: "", endDate: "", bullets: [] };
}

function parseExperienceBlock(lines: string[]): ResumeData["experience"] {
  const entries: ResumeData["experience"] = [];
  let current: ResumeData["experience"][number] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBullet = /^[-•*▪●◦‣]/.test(trimmed);
    if (isBullet) {
      if (!current) {
        current = newEntry();
        entries.push(current);
      }
      current.bullets.push(...splitBullets([trimmed]));
      continue;
    }

    const dateMatch = trimmed.match(DATE_RANGE_RE);
    const isFreshEntry = current && current.bullets.length === 0 && !current.startDate && !current.title;

    if (dateMatch) {
      const beforeDate = trimmed.slice(0, dateMatch.index).trim();
      if (current && current.bullets.length === 0 && !current.startDate) {
        // Date line following a title-only entry: attach dates to it.
        current.startDate = dateMatch[1];
        current.endDate = dateMatch[2];
        if (beforeDate) {
          const parts = beforeDate.split(/[|,–-]{1}/).map((p) => p.trim()).filter(Boolean);
          if (!current.title) current.title = parts[0] ?? beforeDate;
          if (!current.company) current.company = parts[1] ?? "";
          if (!current.location) current.location = parts[2] ?? "";
        }
        continue;
      }
      current = newEntry();
      entries.push(current);
      const parts = beforeDate.split(/[|,–-]{1}/).map((p) => p.trim()).filter(Boolean);
      current.title = parts[0] ?? beforeDate;
      current.company = parts[1] ?? "";
      current.location = parts[2] ?? "";
      current.startDate = dateMatch[1];
      current.endDate = dateMatch[2];
      continue;
    }

    if (isFreshEntry) {
      // A second header-ish line before any date/bullets showed up — treat as
      // extra title/company/location detail rather than a new job.
      const parts = trimmed.split(/[|,–-]{1}/).map((p) => p.trim()).filter(Boolean);
      if (!current!.location) current!.location = parts[0] ?? trimmed;
      continue;
    }

    if (!current || current.bullets.length > 0) {
      current = newEntry();
      entries.push(current);
      const parts = trimmed.split(/[|,–-]{1}/).map((p) => p.trim()).filter(Boolean);
      current.title = parts[0] ?? trimmed;
      current.company = parts[1] ?? "";
      current.location = parts[2] ?? "";
      continue;
    }
  }

  return entries.filter((e) => e.title || e.bullets.length > 0);
}

function parseEducationBlock(lines: string[]): ResumeData["education"] {
  const entries: ResumeData["education"] = [];
  let current: ResumeData["education"][number] | null = null;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const dateMatch = trimmed.match(DATE_RANGE_RE);
    const beforeDate = dateMatch ? trimmed.slice(0, dateMatch.index).trim() : trimmed;

    if (dateMatch && current && !current.startDate && !beforeDate) {
      current.startDate = dateMatch[1];
      current.endDate = dateMatch[2];
      continue;
    }

    const parts = beforeDate.split(/[|,–-]{1}/).map((p) => p.trim()).filter(Boolean);
    current = {
      id: uid(),
      school: parts[0] ?? beforeDate,
      degree: parts[1] ?? "",
      location: parts[2] ?? "",
      startDate: dateMatch?.[1] ?? "",
      endDate: dateMatch?.[2] ?? "",
      details: "",
    };
    entries.push(current);
  }
  return entries;
}

function parseProjectsBlock(lines: string[]): ResumeData["projects"] {
  const entries: ResumeData["projects"] = [];
  let current: ResumeData["projects"][number] | null = null;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const isBullet = /^[-•*▪●◦‣]/.test(trimmed);
    const url = trimmed.match(URL_RE);

    if (isBullet && current) {
      const line = trimmed.replace(/^[-•*▪●◦‣\s]+/, "").trim();
      current.description = current.description ? `${current.description} ${line}` : line;
      continue;
    }

    if (!current || (current.name && current.description)) {
      current = emptyProjectEntry();
      entries.push(current);
    }

    if (url && !current.link) {
      current.link = url[0];
      const before = trimmed.slice(0, url.index).trim();
      if (before && !current.name) current.name = before.replace(/[|,–-]+$/, "").trim();
      continue;
    }

    if (!current.name) {
      const parts = trimmed.split(/[|]/).map((p) => p.trim()).filter(Boolean);
      current.name = parts[0] ?? trimmed;
      if (parts[1]) current.tech = parts[1];
    } else {
      current.description = current.description ? `${current.description} ${trimmed}` : trimmed;
    }
  }

  return entries.filter((e) => e.name || e.description);
}

function emptyProjectEntry(): ResumeData["projects"][number] {
  return { id: uid(), name: "", tech: "", link: "", description: "" };
}

function parseSkillsBlock(lines: string[]): string {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

export function heuristicParseResume(rawText: string): ResumeData {
  const data = emptyResumeData();
  const lines = rawText.replace(/\r/g, "").split("\n");

  // Contact info: scan the first ~10 non-empty lines for name/email/phone/links.
  const headLines = lines.slice(0, 12).map((l) => l.trim()).filter(Boolean);
  for (const line of headLines) {
    const email = line.match(EMAIL_RE);
    if (email && !data.contact.email) data.contact.email = email[0];
    const phone = line.match(PHONE_RE);
    if (phone && !data.contact.phone) data.contact.phone = phone[0].trim();
    const linkedin = line.match(LINKEDIN_RE);
    if (linkedin && !data.contact.linkedin) data.contact.linkedin = linkedin[0];
    const github = line.match(GITHUB_RE);
    if (github && !data.contact.github) data.contact.github = github[0];
    const url = line.match(URL_RE);
    if (url && !linkedin && !github && !data.contact.website) data.contact.website = url[0];
  }
  if (headLines.length > 0 && !EMAIL_RE.test(headLines[0]) && headLines[0].length < 60) {
    data.contact.fullName = headLines[0];
  }

  // Group lines into sections by detected headers.
  const sections: { key: keyof ResumeData | "skip"; lines: string[] }[] = [];
  let currentSection: (typeof sections)[number] | null = null;

  for (const line of lines) {
    if (looksLikeHeader(line)) {
      const key = normalizeHeader(line) ?? "skip";
      currentSection = { key, lines: [] };
      sections.push(currentSection);
      continue;
    }
    if (currentSection) currentSection.lines.push(line);
  }

  for (const section of sections) {
    if (section.key === "summary") {
      data.summary = section.lines.map((l) => l.trim()).filter(Boolean).join(" ");
    } else if (section.key === "skills") {
      data.skills = parseSkillsBlock(section.lines);
    } else if (section.key === "experience") {
      data.experience.push(...parseExperienceBlock(section.lines));
    } else if (section.key === "education") {
      data.education.push(...parseEducationBlock(section.lines));
    } else if (section.key === "projects") {
      data.projects.push(...parseProjectsBlock(section.lines));
    } else if (section.key === "certifications") {
      data.certifications = section.lines
        .map((l) => l.replace(/^[-•*\s]+/, "").trim())
        .filter(Boolean)
        .join("\n");
    }
  }

  // Fallback: if no summary section was found, use the first paragraph
  // after the contact block as a rough summary.
  if (!data.summary) {
    const firstParagraph = lines
      .slice(headLines.length)
      .find((l) => l.trim().length > 40 && !looksLikeHeader(l));
    if (firstParagraph) data.summary = firstParagraph.trim();
  }

  return data;
}
