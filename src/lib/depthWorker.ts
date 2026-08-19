/// <reference lib="webworker" />
import { pipeline, env } from "@huggingface/transformers";

// Always fetch models from the HF CDN rather than expecting local hosting.
env.allowLocalModels = false;

export type WorkerRequest = { type: "estimate"; id: number; imageDataUrl: string };
export type WorkerResponse =
  | { type: "progress"; status: string; progress?: number }
  | { type: "result"; id: number; width: number; height: number; depth: Float32Array }
  | { type: "error"; id: number; message: string };

type DepthMap = { data: Float32Array | Uint8ClampedArray | Uint8Array; width: number; height: number };
type DepthEstimator = (input: string) => Promise<{ depth: DepthMap }>;

let estimatorPromise: Promise<DepthEstimator> | null = null;

function getEstimator(): Promise<DepthEstimator> {
  if (!estimatorPromise) {
    estimatorPromise = pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", {
      progress_callback: (data: unknown) => {
        const info = data as { status?: string; progress?: number };
        post({ type: "progress", status: info.status ?? "loading", progress: info.progress });
      },
    }) as unknown as Promise<DepthEstimator>;
  }
  return estimatorPromise;
}

function post(message: WorkerResponse) {
  (self as unknown as Worker).postMessage(message);
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { data } = event;
  if (data.type !== "estimate") return;

  try {
    const estimator = await getEstimator();
    const output = await estimator(data.imageDataUrl);
    const { data: depthData, width, height } = output.depth;
    post({
      type: "result",
      id: data.id,
      width,
      height,
      depth: Float32Array.from(depthData as Iterable<number>),
    });
  } catch (err) {
    post({ type: "error", id: data.id, message: err instanceof Error ? err.message : String(err) });
  }
};
