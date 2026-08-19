import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerRequest, WorkerResponse } from "./depthWorker";

export type DepthResult = { width: number; height: number; depth: Float32Array };
export type LoadStatus = { status: string; progress?: number } | null;

let nextId = 1;

export function useDepthEstimator() {
  const workerRef = useRef<Worker | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(null);
  const pending = useRef<Map<number, { resolve: (r: DepthResult) => void; reject: (e: Error) => void }>>(new Map());

  useEffect(() => {
    const worker = new Worker(new URL("./depthWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.type === "progress") {
        setLoadStatus({ status: msg.status, progress: msg.progress });
      } else if (msg.type === "result") {
        setLoadStatus(null);
        pending.current.get(msg.id)?.resolve({ width: msg.width, height: msg.height, depth: msg.depth });
        pending.current.delete(msg.id);
      } else if (msg.type === "error") {
        setLoadStatus(null);
        pending.current.get(msg.id)?.reject(new Error(msg.message));
        pending.current.delete(msg.id);
      }
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const estimate = useCallback((imageDataUrl: string): Promise<DepthResult> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error("Depth worker not ready"));
        return;
      }
      const id = nextId++;
      pending.current.set(id, { resolve, reject });
      const request: WorkerRequest = { type: "estimate", id, imageDataUrl };
      worker.postMessage(request);
    });
  }, []);

  return { estimate, loadStatus };
}
