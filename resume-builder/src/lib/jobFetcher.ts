import * as cheerio from "cheerio";
import type { JobFetchResult } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/124.0.0.0 Safari/537.36";

function detectSource(url: string): JobFetchResult["source"] {
  const host = new URL(url).hostname;
  if (host.includes("linkedin.com")) return "linkedin";
  if (host.includes("indeed.com")) return "indeed";
  if (host.includes("glassdoor.com")) return "glassdoor";
  return "generic";
}

const SITE_SELECTORS: Record<string, { description: string[]; title: string[]; company: string[] }> = {
  linkedin: {
    description: [".show-more-less-html__markup", ".description__text", "[class*='jobs-description']"],
    title: ["h1", ".top-card-layout__title"],
    company: [".topcard__org-name-link", ".top-card-layout__second-subline a"],
  },
  indeed: {
    description: ["#jobDescriptionText", ".jobsearch-jobDescriptionText"],
    title: ["h1.jobsearch-JobInfoHeader-title", "h1"],
    company: ["[data-company-name='true']", ".jobsearch-InlineCompanyRating div"],
  },
  glassdoor: {
    description: ["[class*='JobDetails_jobDescription']", "#JobDescriptionContainer"],
    title: ["[class*='JobDetails_jobTitle']", "h1"],
    company: ["[class*='EmployerProfile_employerName']", "[class*='JobDetails_employerName']"],
  },
};

function extractBySelectors($: cheerio.CheerioAPI, selectors: string[]): string {
  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    if (text.length > 80) return text;
  }
  return "";
}

function genericExtract($: cheerio.CheerioAPI): string {
  $("script, style, nav, header, footer, noscript, svg").remove();
  let best = "";
  $("article, main, [class*='description'], [class*='content'], section, div").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length > best.length && text.length < 20000) best = text;
  });
  if (!best) best = $("body").text().replace(/\s+/g, " ").trim();
  return best;
}

const MIN_DESCRIPTION_LENGTH = 120;

export async function fetchJobDescription(url: string): Promise<JobFetchResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http(s) URLs are supported.");
  }

  const source = detectSource(url);

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `The job site returned an error (HTTP ${response.status}). Many job boards block automated ` +
        "requests — paste the job description text instead.",
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const config = SITE_SELECTORS[source];

  let description = config ? extractBySelectors($, config.description) : "";
  if (!description) description = genericExtract($);

  const title = (config ? extractBySelectors($, config.title) : "") || $("title").first().text().trim();
  const company = config ? extractBySelectors($, config.company) : "";

  if (description.replace(/\s+/g, " ").trim().length < MIN_DESCRIPTION_LENGTH) {
    throw new Error(
      "Couldn't read enough of the job description from that page (the site may require a login " +
        "or block automated requests). Paste the job description text instead.",
    );
  }

  return {
    jobTitle: title.slice(0, 200),
    company: company.slice(0, 200),
    description: description.slice(0, 20000),
    source,
  };
}
