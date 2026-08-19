# Real-Time Crowd Counting System

A real-time crowd counting dashboard that detects and counts people from a
live webcam feed or uploaded video footage, tracks the count over time, and
raises alerts when a configurable safe-capacity limit is crossed — useful for
malls, events, railway stations, classrooms, and other public spaces.

**Live demo:** deploy to Netlify (see below) and drop the URL here.

## How it works

Object detection (a MobileNet-SSD "person detector", the browser-friendly
counterpart to a YOLO-style detector) runs **entirely client-side** using
[TensorFlow.js](https://www.tensorflow.org/js) and the pretrained
[COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
model:

1. A `<video>` element is fed by the browser webcam (`getUserMedia`) or a
   user-uploaded video file (recorded CCTV/webcam footage).
2. Every ~130ms a frame is run through the object detector, and detections
   are filtered down to the `person` class above a confidence threshold.
3. Bounding boxes are drawn on a `<canvas>` overlay and the person count is
   smoothed over a short rolling window to reduce frame-to-frame jitter.
4. The smoothed count feeds a live history chart, running stats (current /
   peak / average count, detections per second), and the alert system.
5. When the count reaches the configured safe limit, a visual alert banner
   activates, an audible warning beep plays (Web Audio API), a browser
   notification is raised (if permitted), and the event is logged.

Because inference happens in the browser, no video frame is ever uploaded to
a server — which is also exactly why this fits Netlify: the whole app is a
static site with no backend to run.

> **Why not a Python/OpenCV/YOLO backend?** Netlify only hosts static sites
> and short-lived serverless functions — it cannot run a persistent Python
> process, a Streamlit server, or a live OpenCV video pipeline. Running
> detection client-side with TensorFlow.js keeps everything on Netlify's free
> static hosting, keeps the "real-time" requirement (continuous webcam
> analysis, not request/response), and keeps footage private to the viewer's
> browser. If you want a true Python/OpenCV/YOLO pipeline, point this UI at
> an external inference API (e.g. a FastAPI + Ultralytics YOLO service
> deployed on Render/Railway/HF Spaces) instead.

## Features

- Live webcam monitoring or uploaded video file analysis
- Real-time person detection with on-video bounding boxes
- Smoothed counting logic to reduce flicker
- Configurable safe-capacity threshold and detection confidence
- Live count history chart
- Stats dashboard: current / peak / average count, detections per second
- Alert system: visual banner, audio beep, browser notification, alert log
- 100% client-side — works on Netlify's static hosting, no backend required

## Tech stack

- React + TypeScript + Vite
- TensorFlow.js + COCO-SSD (pretrained person detector)
- Plain CSS (dark dashboard theme), canvas-based chart — no heavy UI/chart
  libraries

## Skills demonstrated

Person detection · video analytics · counting logic · real-time monitoring ·
alert system design · frontend dashboard engineering

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL and allow camera access, or switch to "Video
file" and upload a clip to analyze.

### Build

```bash
npm run build   # type-checks and builds to dist/
npm run preview # preview the production build locally
```

## Deploying to Netlify

This repo includes a `netlify.toml` with the build already configured:

- Build command: `npm run build`
- Publish directory: `dist`

**Option A — Netlify UI:** "Add new site" → "Import an existing project" →
pick this repository. Netlify reads `netlify.toml` automatically; no extra
configuration is needed.

**Option B — Netlify CLI:**

```bash
npm install -g netlify-cli
netlify deploy --build --prod
```

Note: browser camera access requires HTTPS (or `localhost`) — Netlify serves
over HTTPS by default, so the webcam will work once deployed.

## Project structure

```
src/
  components/     UI panels: video feed, controls, stats, alerts, chart
  hooks/useModel.ts   Loads the COCO-SSD model once and keeps it warm
  utils/audio.ts      Web Audio API alert beep (no audio asset needed)
  App.tsx             Detection pipeline state: smoothing, history, alerts
netlify.toml      Netlify build + SPA redirect + security headers
```

## Possible extensions

- Swap COCO-SSD for a browser-exported YOLOv8n (ONNX) for higher accuracy
- Multi-camera / multi-zone dashboards with per-zone thresholds
- Density-heatmap estimation for very dense crowds where individual boxes
  overlap too much to count reliably
- Push alerts to Slack/email via a Netlify Function webhook
- Persist history/alerts to a backing store for historical reporting
