# ATS Resume Builder

A simplified web app version of a "job-application agent": upload your resume, paste a job
description, and download a tailored, ATS-friendly PDF — entirely in your browser.

## How it works

1. **Upload your resume** — PDF, DOCX, or TXT. Parsing happens client-side (pdf.js / mammoth) and
   is extracted into structured fields (contact info, summary, skills, experience, education,
   certifications). Nothing is uploaded to a server.
2. **Paste the job description** — job boards (LinkedIn, Indeed, Glassdoor, etc.) block automated
   fetching, so copy the description text from the posting and paste it in.
3. **Review & optimize** — the app compares your resume against the job description, reorders and
   emphasizes content toward the job's keywords, and shows an ATS keyword-match score before/after.
   You can hand-edit anything before exporting.
4. **Download** — a PDF generated client-side with a plain, ATS-safe layout (no tables, columns,
   icons, or images that trip up parsers). The renderer shrinks font size across a few readable
   tiers to fit as much as possible on one page, but it won't cram content into unreadably small
   text — if you have a lot of experience, the PDF is simply more than one page. It checks the
   actual rendered page count and tells you how many pages you got.

This is a fully static site — a rule-based parser/optimizer (regex section detection,
keyword-frequency extraction, relevance-based reordering) does the work, with no server and no API
keys required.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

See [DEPLOY.md](./DEPLOY.md). `npm run build` produces a static `out/` folder — drag that folder
onto Netlify Drop, or deploy it to any static host.

## Project layout

- `src/app/page.tsx` — the 3-step wizard UI (upload → job posting → review/download).
- `src/lib/resumeParser.ts` — client-side PDF/DOCX/TXT text extraction.
- `src/lib/structuredResume.ts` / `heuristicParser.ts` — raw text → structured resume JSON.
- `src/lib/resumeOptimizer.ts` / `keywords.ts` — keyword extraction and relevance-based tailoring.
- `src/lib/pdf/` — the resume PDF template and client-side rendering (`@react-pdf/renderer`).

## Notes & limitations

- Resumes that are scanned images (no selectable text) can't be parsed; export as a text-based
  PDF/DOCX first.
- Nothing is persisted — everything lives in the browser tab and is gone on refresh.
