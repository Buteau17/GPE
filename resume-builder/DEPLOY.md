# Deploying to Netlify

This app is a fully static site now — no server, no API routes, no environment variables. That
means the simplest possible deploy method actually works: build it, then drag the output folder
onto Netlify.

## Drag-and-drop (Netlify Drop)

```bash
npm install
npm run build
```

This produces a static `out/` folder. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
and drag the **`out` folder itself** (not the whole project, not a zip — the folder that contains
`index.html`) onto the page. Netlify uploads it as-is and gives you a live URL immediately.

To update the site later, rebuild (`npm run build`) and drag the new `out` folder onto the same
site's Deploys page.

## Netlify CLI (optional alternative)

If you'd rather deploy from the terminal:

```bash
npm install
npm run build
npx netlify-cli deploy --dir out --prod
```

`--dir out` uploads the pre-built static folder directly — no need for `--build`, no Next.js
Runtime plugin, no publish-directory configuration to get wrong.
