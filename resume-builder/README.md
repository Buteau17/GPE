# ATS Resume Builder

A simplified web app version of a "job-application agent": upload your resume, point it at a job
posting, and download a tailored, ATS-friendly PDF.

## How it works

1. **Upload your resume** — PDF, DOCX, or TXT. The server extracts the text and parses it into
   structured fields (contact info, summary, skills, experience, education, certifications).
2. **Add a job posting** — paste a LinkedIn, Indeed, or Glassdoor link and the app tries to fetch
   and read the job description directly from the page. Job sites frequently block automated
   requests or require a login, so you can always paste the job description text instead.
3. **Review & optimize** — the app compares your resume against the job description, reorders and
   tailors content toward the job's keywords, and shows an ATS keyword-match score before/after.
   You can hand-edit anything before exporting.
4. **Download** — a PDF generated server-side with a plain, ATS-safe layout (no tables, columns,
   icons, or images that trip up parsers). The renderer shrinks font size across a few readable
   tiers to fit as much as possible on one page, but it won't cram content into unreadably small
   text — if you have a lot of experience, the PDF is simply more than one page. It checks the
   actual rendered page count and tells you how many pages you got.

## AI-tailored vs. rule-based mode

Resume parsing and optimization can run in two modes:

- **With `ANTHROPIC_API_KEY` set** — resume parsing and job-tailored rewriting are done by Claude
  (`claude-opus-5`), which produces much more accurate section extraction and higher-quality,
  targeted rewrites. The model is explicitly instructed to never invent employers, titles, dates,
  or skills that aren't already in your resume — it can only rephrase, reorder, and emphasize.
- **Without a key** — the app falls back to a deterministic, rule-based parser/optimizer (regex
  section detection, keyword-frequency extraction, relevance-based reordering). No external calls
  are made, so it always works out of the box.

Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` to enable AI mode.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

- `src/app/page.tsx` — the 3-step wizard UI (upload → job posting → review/download).
- `src/app/api/resume/parse` — file upload → extracted text → structured resume JSON.
- `src/app/api/job/fetch` — fetches a job posting URL and extracts the description.
- `src/app/api/resume/optimize` — tailors the resume to a job description + keyword scoring.
- `src/app/api/resume/pdf` — renders the final resume to a single-page PDF.
- `src/lib/` — parsing, scraping, keyword scoring, optimization, and PDF-rendering logic.

## Notes & limitations

- Job boards (LinkedIn, Indeed, Glassdoor, etc.) often block scrapers or require a login to see
  the full description — pasting the job text manually is always available as a fallback.
- Resumes that are scanned images (no selectable text) can't be parsed; export as text-based
  PDF/DOCX first.
- Nothing is persisted — uploads, job descriptions, and generated PDFs exist only for the request
  that produced them.
