# Photo → 3D Splat

Upload a single photo and get back an interactive, orbitable **pseudo-3D
Gaussian-splat-style point cloud** — entirely in your browser, no backend,
deployable as a static site on Netlify.

## How it works

True 3D Gaussian Splatting reconstructs a scene from *many* photos taken
from different angles, using COLMAP for camera/structure recovery and a
GPU training loop to optimize millions of Gaussians — not something a
single photo or a static host can do.

This app instead does a **single-photo pseudo-3D effect**:

1. A monocular depth-estimation model ([Depth Anything V2 small](https://huggingface.co/onnx-community/depth-anything-v2-small),
   run client-side via [🤗 Transformers.js](https://github.com/huggingface/transformers.js)
   in a Web Worker) estimates a depth value for every pixel of the uploaded
   photo.
2. Each pixel is placed in 3D space using its `(x, y)` position and
   estimated depth as `z`, colored with its own RGB value.
3. The resulting point cloud is rendered with [Three.js](https://threejs.org/)
   using soft, radial-gradient point sprites and additive-friendly blending
   to approximate the fuzzy, volumetric look of Gaussian splats.
4. You can orbit/zoom the result, tweak point size / depth strength /
   quality, and export the cloud as a `.ply` point cloud file.

Everything — model inference included — runs on-device in the browser. No
image or data is ever sent to a server, so the app is a plain static site.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy on Netlify

This repo includes a `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`

Steps:

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project**, pick this
   repo. Build settings are picked up automatically from `netlify.toml`.
3. Deploy. The first depth-model download happens client-side from the
   Hugging Face CDN and is cached by the browser afterwards.

Or via the Netlify CLI:

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## Notes / limitations

- Depth estimation quality depends on the source photo; it's a *single-view*
  depth guess, not true multi-view geometry, so extreme camera moves will
  reveal it's a relief, not a full reconstruction.
- The first run downloads the depth model (a few tens of MB) from the
  Hugging Face CDN; subsequent runs use the browser cache.
- "Quality" controls how many pixels are sampled into the point cloud
  (draft/balanced/fine) — higher quality means more points and a heavier
  scene.
