import { useCallback, useMemo, useState } from "react";
import { UploadPanel } from "./components/UploadPanel";
import { SplatViewer } from "./components/SplatViewer";
import { useDepthEstimator } from "./lib/useDepthEstimator";
import { buildSplatCloud, type SplatCloud } from "./lib/buildSplatCloud";
import { readFileAsDataUrl, loadImageElement } from "./lib/loadImage";
import { toPlyBlob } from "./lib/exportPly";

type Stage = "idle" | "loading-model" | "estimating" | "building" | "ready" | "error";

const QUALITY_PRESETS = [
  { label: "Draft", stride: 4 },
  { label: "Balanced", stride: 2 },
  { label: "Fine", stride: 1 },
];

export default function App() {
  const { estimate, loadStatus } = useDepthEstimator();
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cloud, setCloud] = useState<SplatCloud | null>(null);

  const [pointSize, setPointSize] = useState(0.055);
  const [depthScale, setDepthScale] = useState(2.5);
  const [strideIdx, setStrideIdx] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [background, setBackground] = useState("#0b0c14");

  const process = useCallback(
    async (file: File, stride: number, depthScaleValue: number) => {
      setError(null);
      setStage("loading-model");
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setPreview(dataUrl);
        const image = await loadImageElement(dataUrl);

        setStage("estimating");
        const depth = await estimate(dataUrl);

        setStage("building");
        const nextCloud = buildSplatCloud(image, depth, { stride, depthScale: depthScaleValue });
        setCloud(nextCloud);
        setStage("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStage("error");
      }
    },
    [estimate],
  );

  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const onFile = useCallback(
    (file: File) => {
      setCurrentFile(file);
      void process(file, QUALITY_PRESETS[strideIdx].stride, depthScale);
    },
    [process, strideIdx, depthScale],
  );

  const rebuild = useCallback(
    (nextStrideIdx: number, nextDepthScale: number) => {
      if (currentFile) void process(currentFile, QUALITY_PRESETS[nextStrideIdx].stride, nextDepthScale);
    },
    [currentFile, process],
  );

  const busy = stage === "loading-model" || stage === "estimating" || stage === "building";

  const statusText = useMemo(() => {
    if (stage === "loading-model" && loadStatus) {
      const pct = loadStatus.progress ? ` ${Math.round(loadStatus.progress)}%` : "";
      return `Downloading depth model (${loadStatus.status})${pct}…`;
    }
    if (stage === "loading-model") return "Preparing depth model…";
    if (stage === "estimating") return "Estimating depth…";
    if (stage === "building") return "Building splat cloud…";
    return null;
  }, [stage, loadStatus]);

  const downloadPly = useCallback(() => {
    if (!cloud) return;
    const blob = toPlyBlob(cloud);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo-splat.ply";
    a.click();
    URL.revokeObjectURL(url);
  }, [cloud]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Photo → 3D Splat</h1>
        <p className="subtitle">
          Upload one photo. A monocular depth model runs locally in your browser and turns it into an interactive,
          orbitable point cloud rendered with soft Gaussian-style splats.
        </p>
      </header>

      <main className="app-main">
        <section className="panel">
          <UploadPanel onFile={onFile} disabled={busy} />

          {preview && (
            <div className="preview">
              <img src={preview} alt="Uploaded preview" />
            </div>
          )}

          {statusText && (
            <div className="status">
              <div className="spinner" />
              <span>{statusText}</span>
            </div>
          )}

          {error && <div className="error">⚠ {error}</div>}

          {stage === "ready" && cloud && (
            <div className="controls">
              <label>
                Point size
                <input
                  type="range"
                  min={0.01}
                  max={0.15}
                  step={0.005}
                  value={pointSize}
                  onChange={(e) => setPointSize(Number(e.target.value))}
                />
              </label>
              <label>
                Depth strength
                <input
                  type="range"
                  min={0.5}
                  max={6}
                  step={0.1}
                  value={depthScale}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setDepthScale(v);
                    rebuild(strideIdx, v);
                  }}
                />
              </label>
              <label>
                Quality
                <select
                  value={strideIdx}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setStrideIdx(v);
                    rebuild(v, depthScale);
                  }}
                >
                  {QUALITY_PRESETS.map((p, i) => (
                    <option key={p.label} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
                Auto-rotate
              </label>
              <label>
                Background
                <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
              </label>
              <button className="download" onClick={downloadPly}>
                Download .ply
              </button>
              <p className="point-count">{cloud.count.toLocaleString()} points</p>
            </div>
          )}
        </section>

        <section className="viewer-wrap">
          <SplatViewer cloud={cloud} pointSize={pointSize} autoRotate={autoRotate} background={background} />
          {!cloud && !busy && <div className="viewer-placeholder">Your 3D splat will appear here</div>}
        </section>
      </main>

      <footer className="app-footer">
        <span>Runs fully client-side · depth model from Hugging Face · nothing leaves your device</span>
        <span className="credit">
          Designed by{" "}
          <a href="https://github.com/Buteau17" target="_blank" rel="noopener noreferrer">
            Buteau17
          </a>
        </span>
      </footer>
    </div>
  );
}
