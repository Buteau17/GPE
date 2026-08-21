# ATS Resume Builder

A simplified web app version of a "job-application agent": upload your resume, paste a job
description, and download a tailored, ATS-friendly PDF — entirely in your browser.

## How it works

1. **Upload your CV** — PDF, DOCX, or TXT. Parsing happens client-side (pdf.js / mammoth) and is
   extracted into structured, editable fields (contact info, summary, skills, experience,
   education, projects, certifications). Nothing is uploaded to a server.
2. **Paste the target job posting** — job boards (LinkedIn, Indeed, Glassdoor, etc.) block
   automated fetching, so copy the description text from the posting and paste it in.
3. **Tailor & edit** — one click reorders and emphasizes resume content toward the job's keywords
   and shows an ATS keyword-match score before/after, plus a live field-completeness checklist. A
   side-by-side live preview and every field is hand-editable.
4. **Download** — a PDF generated client-side with a plain, ATS-safe layout (no tables, columns,
   icons, or images that trip up parsers). The renderer shrinks font size across a few readable
   tiers to fit as much as possible on one page, but it won't cram content into unreadably small
   text — if you have a lot of experience, the PDF is simply more than one page. It checks the
   actual rendered page count and tells you how many pages you got. A "Copy text" button is also
   available for pasting into an application form directly.

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

- `src/app/page.tsx` — top-level state and layout (intake panel, ATS meter, editor, live preview).
- `src/components/IntakePanel.tsx` — CV upload + job description paste + "Tailor" action.
- `src/components/EditorPanel.tsx` — accordion sections for contact/summary/experience/education/skills/projects.
- `src/components/AtsMeter.tsx` — field-completeness checklist + job-keyword match score.
- `src/components/PreviewPane.tsx` — live resume preview.
- `src/lib/resumeParser.ts` — client-side PDF/DOCX/TXT text extraction.
- `src/lib/structuredResume.ts` / `heuristicParser.ts` — raw text → structured resume JSON.
- `src/lib/resumeOptimizer.ts` / `keywords.ts` — keyword extraction and relevance-based tailoring.
- `src/lib/pdf/` — the resume PDF template and client-side rendering (`@react-pdf/renderer`).

## Notes & limitations

- Resumes that are scanned images (no selectable text) can't be parsed; export as a text-based
  PDF/DOCX first.
- Nothing is persisted — everything lives in the browser tab and is gone on refresh.
