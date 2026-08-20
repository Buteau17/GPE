# Deploying to Netlify

The easiest path is the Netlify CLI — it builds the app correctly and
deploys it directly, without needing to connect a Git repo.

```bash
cd resume-builder
npm install
npx netlify-cli login    # opens a browser tab once, to authorize
npx netlify-cli unlink   # in case this folder is already linked to a site
npx netlify-cli deploy --build --prod
```

- `--build` runs `npm run build` locally and uploads the correct output —
  this avoids the "publish directory" error you get from dragging the
  raw folder onto Netlify Drop.
- When it asks how to proceed, choose **"+ Create & configure a new
  project"** — do NOT link to a site that was previously created via
  Netlify Drop. Drop-created sites can have a stale "publish directory"
  setting baked in that isn't editable from the dashboard and will make
  every build fail with `Your publish directory cannot be the same as
  the base directory`. A fresh site avoids that entirely.
- It prints your live URL when done.

## Optional: AI-tailored resume rewriting

By default the app tailors resumes with a rule-based keyword optimizer
(no API key needed). To use Claude for smarter, context-aware rewriting,
set an environment variable before or after deploying:

```bash
npx netlify-cli env:set ANTHROPIC_API_KEY sk-ant-...
```

(Netlify dashboard: Project configuration → Environment variables.)
