export type SplatCloud = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  count: number;
};

export type BuildOptions = {
  /** Skip this many source pixels between samples per axis (1 = every pixel). */
  stride: number;
  /** How strongly depth pushes points along Z, in scene units. */
  depthScale: number;
};

/**
 * Fuses an <img>'s pixels with a same-aspect depth map into a colored point
 * cloud. Depth values are expected roughly in [0, 1] with larger = closer,
 * matching the Depth Anything output convention.
 */
export function buildSplatCloud(
  image: HTMLImageElement,
  depth: { width: number; height: number; depth: Float32Array },
  options: BuildOptions,
): SplatCloud {
  const canvas = document.createElement("canvas");
  canvas.width = depth.width;
  canvas.height = depth.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.drawImage(image, 0, 0, depth.width, depth.height);
  const { data: pixels } = ctx.getImageData(0, 0, depth.width, depth.height);

  const { width, height, depth: depthData } = depth;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < depthData.length; i++) {
    const v = depthData[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = Math.max(max - min, 1e-6);

  const stride = Math.max(1, Math.floor(options.stride));
  const cols = Math.floor(width / stride);
  const rows = Math.floor(height / stride);
  const maxCount = cols * rows;

  const positions = new Float32Array(maxCount * 3);
  const colors = new Float32Array(maxCount * 3);
  const sizes = new Float32Array(maxCount);

  const aspect = width / height;
  let count = 0;

  for (let row = 0; row < rows; row++) {
    const y = row * stride;
    for (let col = 0; col < cols; col++) {
      const x = col * stride;
      const depthIdx = y * width + x;
      const normDepth = (depthData[depthIdx] - min) / range; // 0 = far, 1 = near

      const pixelIdx = depthIdx * 4;
      const r = pixels[pixelIdx] / 255;
      const g = pixels[pixelIdx + 1] / 255;
      const b = pixels[pixelIdx + 2] / 255;
      const a = pixels[pixelIdx + 3];
      if (a < 8) continue; // skip fully transparent source pixels

      const px = (x / width - 0.5) * aspect * 10;
      const py = -(y / height - 0.5) * 10;
      const pz = normDepth * options.depthScale;

      const o = count * 3;
      positions[o] = px;
      positions[o + 1] = py;
      positions[o + 2] = pz;
      colors[o] = r;
      colors[o + 1] = g;
      colors[o + 2] = b;
      sizes[count] = 0.055 + normDepth * 0.05;
      count++;
    }
  }

  return {
    positions: positions.subarray(0, count * 3),
    colors: colors.subarray(0, count * 3),
    sizes: sizes.subarray(0, count),
    count,
  };
}
