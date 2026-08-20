# Deploying to Netlify

The easiest path is the Netlify CLI — it builds the app correctly and
deploys it directly, without needing to connect a Git repo.

```bash
cd resume-builder
npm install
npx netlify-cli login    # opens a browser tab once, to authorize
npx netlify-cli deploy --build --prod
```

- `--build` runs `npm run build` locally and uploads the correct output —
  this avoids the "publish directory" error you get from dragging the
  raw folder onto Netlify Drop.
- On first run it asks whether to create a new site or link an existing
  one. Either is fine; creating a new site is the cleanest option.
- It prints your live URL when done.

## Optional: AI-tailored resume rewriting

By default the app tailors resumes with a rule-based keyword optimizer
(no API key needed). To use Claude for smarter, context-aware rewriting,
set an environment variable before or after deploying:

```bash
npx netlify-cli env:set ANTHROPIC_API_KEY sk-ant-...
```

(Netlify dashboard: Project configuration → Environment variables.)
