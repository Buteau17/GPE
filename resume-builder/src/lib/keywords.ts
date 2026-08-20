import type { KeywordAnalysis } from "./types";

const STOPWORDS = new Set(
  (
    "a about above after again against all am an and any are aren't as at be because been before " +
    "being below between both but by can't cannot could couldn't did didn't do does doesn't doing " +
    "don't down during each few for from further had hadn't has hasn't have haven't having he he'd " +
    "he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into " +
    "is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only " +
    "or other ought our ours ourselves out over own same shan't she she'd she'll she's should " +
    "shouldn't so some such than that that's the their theirs them themselves then there there's " +
    "these they they'd they'll they're they've this those through to too under until up very was " +
    "wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while " +
    "who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours " +
    "yourself yourselves will etc us using use used within across per year years role team work " +
    "including include job company please equal opportunity employer"
  ).split(" "),
);

const GENERIC_JOB_WORDS = new Set([
  "experience",
  "ability",
  "skills",
  "strong",
  "excellent",
  "responsibilities",
  "requirements",
  "qualifications",
  "preferred",
  "required",
  "candidate",
  "candidates",
  "position",
  "opportunity",
  "environment",
  "successful",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[./-]+|[./-]+$/g, "").trim())
    .filter(Boolean);
}

function extractPhrases(text: string, maxPhrases: number): string[] {
  const words = tokenize(text);
  const freq = new Map<string, number>();

  const addTerm = (term: string) => {
    if (term.length < 3) return;
    if (STOPWORDS.has(term) || GENERIC_JOB_WORDS.has(term)) return;
    freq.set(term, (freq.get(term) ?? 0) + 1);
  };

  for (let i = 0; i < words.length; i++) {
    addTerm(words[i]);
    if (i < words.length - 1) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (!STOPWORDS.has(words[i]) && !STOPWORDS.has(words[i + 1])) {
        addTerm(bigram);
      }
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([term]) => term);
}

export function extractJobKeywords(jobDescription: string, limit = 25): string[] {
  return extractPhrases(jobDescription, limit);
}

export function computeKeywordMatch(resumeText: string, jobKeywords: string[]): {
  matched: string[];
  missing: string[];
  score: number;
} {
  const resumeLower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jobKeywords) {
    if (resumeLower.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const score = jobKeywords.length === 0 ? 100 : Math.round((matched.length / jobKeywords.length) * 100);
  return { matched, missing, score };
}

export function buildKeywordAnalysis(
  resumeTextBefore: string,
  resumeTextAfter: string,
  jobDescription: string,
): KeywordAnalysis {
  const jobKeywords = extractJobKeywords(jobDescription);
  const before = computeKeywordMatch(resumeTextBefore, jobKeywords);
  const after = computeKeywordMatch(resumeTextAfter, jobKeywords);
  return {
    matched: after.matched,
    missing: after.missing,
    scoreBefore: before.score,
    scoreAfter: after.score,
  };
}
