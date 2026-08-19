import type { SplatCloud } from "./buildSplatCloud";

/** Serializes a splat cloud to an ASCII PLY point cloud file. */
export function toPlyBlob(cloud: SplatCloud): Blob {
  const lines = [
    "ply",
    "format ascii 1.0",
    `element vertex ${cloud.count}`,
    "property float x",
    "property float y",
    "property float z",
    "property uchar red",
    "property uchar green",
    "property uchar blue",
    "end_header",
  ];

  for (let i = 0; i < cloud.count; i++) {
    const o = i * 3;
    const x = cloud.positions[o].toFixed(5);
    const y = cloud.positions[o + 1].toFixed(5);
    const z = cloud.positions[o + 2].toFixed(5);
    const r = Math.round(cloud.colors[o] * 255);
    const g = Math.round(cloud.colors[o + 1] * 255);
    const b = Math.round(cloud.colors[o + 2] * 255);
    lines.push(`${x} ${y} ${z} ${r} ${g} ${b}`);
  }

  return new Blob([lines.join("\n")], { type: "text/plain" });
}
