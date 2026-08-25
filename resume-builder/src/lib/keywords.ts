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
  "looking",
  "seeking",
  "seek",
  "build",
  "building",
  "improve",
  "improving",
  "help",
  "helping",
  "great",
  "good",
  "new",
  "plus",
  "you",
  "your",
  "we",
  "processing",
  "activities",
  "activity",
  "ensure",
  "ensuring",
  "ensures",
  "providing",
  "provide",
  "provides",
  "discussions",
  "discussion",
  "quality",
  "closely",
  "paced",
  "fast-paced",
  "communication",
  "stakeholders",
  "stakeholder",
  "delivery",
  "deliver",
  "delivering",
  "validate",
  "validating",
  "validation",
  "support",
  "supporting",
  "participate",
  "participating",
  "participates",
  "collaborate",
  "collaborating",
  "collaboration",
  "collaborative",
  "drive",
  "driving",
  "lead",
  "leading",
  "manage",
  "managing",
  "management",
  "own",
  "owning",
  "ownership",
  "execute",
  "executing",
  "contribute",
  "contributing",
  "engage",
  "engaging",
  "foster",
  "fostering",
  "streamline",
  "streamlining",
  "initiatives",
  "initiative",
  "projects",
  "project",
  "tasks",
  "task",
  "duties",
  "duty",
  "expectations",
  "expectation",
  "culture",
  "mindset",
  "growth",
  "impact",
  "value",
  "values",
  "results",
  "result",
  "outcomes",
  "outcome",
  "environments",
  "communicate",
  "communicating",
  "communicates",
  "cross-functional",
  "dynamic",
  "day-to-day",
]);

function tokenize(text: string): string[] {
  return text
    .replace(/[^a-zA-Z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[./-]+|[./-]+$/g, "").trim())
    .filter(Boolean);
}

// Real skills/technologies in job postings are almost always capitalized
// proper nouns or acronyms (React, AWS, Node.js), or contain a digit/symbol
// (C++, 3D). Generic filler words from job-posting prose ("activities",
// "ensure", "working") are essentially always lowercase mid-sentence — using
// that signal is far more robust than trying to hand-maintain an
// ever-growing stopword list of every possible generic word.
function looksLikeSkillTerm(word: string): boolean {
  return /[0-9+#.]/.test(word) || /^[A-Z]/.test(word);
}

function preferDisplay(current: string | undefined, candidate: string): string {
  if (!current) return candidate;
  const currentHasCase = /[A-Z]/.test(current);
  const candidateHasCase = /[A-Z]/.test(candidate);
  return !currentHasCase && candidateHasCase ? candidate : current;
}

function extractPhrases(text: string, maxPhrases: number): string[] {
  // Split on list/clause punctuation first so bigrams never form across it —
  // "Pandas, NumPy, Scikit-learn" is three separate terms, not "Pandas NumPy".
  const segments = text.split(/[,;()/|•\n]+/);
  const freq = new Map<string, number>();
  const display = new Map<string, string>();
  const eligibleUnigrams = new Set<string>();

  const addTerm = (raw: string, isUnigram: boolean) => {
    const lower = raw.toLowerCase();
    if (lower.length < 3) return;
    if (STOPWORDS.has(lower) || GENERIC_JOB_WORDS.has(lower)) return;
    if (isUnigram && looksLikeSkillTerm(raw)) eligibleUnigrams.add(lower);
    freq.set(lower, (freq.get(lower) ?? 0) + 1);
    display.set(lower, preferDisplay(display.get(lower), raw));
  };

  for (const segment of segments) {
    const rawWords = tokenize(segment);
    for (let i = 0; i < rawWords.length; i++) {
      addTerm(rawWords[i], true);
      if (i < rawWords.length - 1) {
        const [w1, w2] = [rawWords[i], rawWords[i + 1]];
        const [l1, l2] = [w1.toLowerCase(), w2.toLowerCase()];
        if (![l1, l2].some((w) => STOPWORDS.has(w) || GENERIC_JOB_WORDS.has(w))) {
          addTerm(`${w1} ${w2}`, false);
        }
      }
    }
  }

  return [...freq.entries()]
    .filter(([term]) => term.includes(" ") || eligibleUnigrams.has(term))
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([term]) => display.get(term) ?? term);
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
