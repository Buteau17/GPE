import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SplatCloud } from "../lib/buildSplatCloud";

function makeSprite(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export type SplatViewerProps = {
  cloud: SplatCloud | null;
  pointSize: number;
  autoRotate: boolean;
  background: string;
};

export function SplatViewer({ cloud, pointSize, autoRotate, background }: SplatViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  // One-time scene setup.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1;
    controls.maxDistance = 40;
    controlsRef.current = controls;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.autoRotate = autoRotateRef.current;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) controlsRef.current.autoRotateSpeed = 2.2;
  }, [autoRotate]);

  useEffect(() => {
    if (sceneRef.current) sceneRef.current.background = new THREE.Color(background);
  }, [background]);

  // Rebuild geometry when the cloud changes.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (pointsRef.current) {
      scene.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      (pointsRef.current.material as THREE.Material).dispose();
      pointsRef.current = null;
    }
    if (!cloud || cloud.count === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(cloud.positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(cloud.colors, 3));
    geometry.center();

    const material = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
      map: makeSprite(),
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      sizeAttenuation: true,
    });
    materialRef.current = material;

    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);
  }, [cloud, pointSize]);

  useEffect(() => {
    if (materialRef.current) materialRef.current.size = pointSize;
  }, [pointSize]);

  return <div ref={containerRef} className="splat-viewer" />;
}
