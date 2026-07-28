import React, { useMemo } from "react";
import { useThreeEffect } from "./lib/useThreeEffect.js";
import { createLoop } from "./lib/threeLoop.js";

function buildSprite(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(201,168,76,0.95)");
  grad.addColorStop(0.5, "rgba(201,168,76,0.35)");
  grad.addColorStop(1, "rgba(201,168,76,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function mountEmberScene(THREE, el, density) {
  const width = el.clientWidth;
  const height = el.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.pointerEvents = "none";
  el.appendChild(renderer.domElement);

  // Fewer particles on narrow/tablet viewports and for the "low" density
  // variant used on secondary heroes — keeps mobile GPUs and battery happy.
  const base = density === "low" ? 45 : 90;
  const COUNT = width < 640 ? Math.round(base * 0.45) : width < 1024 ? Math.round(base * 0.7) : base;

  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const drifts = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 13;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    speeds[i] = 0.12 + Math.random() * 0.22;
    drifts[i] = (Math.random() - 0.5) * 0.05;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const texture = buildSprite(THREE);
  const material = new THREE.PointsMaterial({
    size: 0.32,
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Points(geometry, material));

  const stopLoop = createLoop({
    el,
    onFrame: (() => {
      const clock = new THREE.Clock();
      return () => {
        const dt = Math.min(clock.getDelta(), 0.05);
        const pos = geometry.attributes.position;
        for (let i = 0; i < COUNT; i++) {
          let y = pos.getY(i) + speeds[i] * dt;
          let x = pos.getX(i) + drifts[i] * dt;
          if (y > 4.2) y = -4.2;
          if (x > 6.6) x = -6.6;
          if (x < -6.6) x = 6.6;
          pos.setY(i, y);
          pos.setX(i, x);
        }
        pos.needsUpdate = true;
      };
    })(),
    onResize: (w, h) => {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    },
    render: () => renderer.render(scene, camera),
  });

  return () => {
    stopLoop();
    renderer.dispose();
    geometry.dispose();
    material.dispose();
    texture.dispose();
    if (renderer.domElement.parentNode === el) {
      el.removeChild(renderer.domElement);
    }
  };
}

export function EmberField({ className, density = "high" }) {
  const mount = useMemo(
    () => (THREE, el) => mountEmberScene(THREE, el, density),
    [density],
  );
  const containerRef = useThreeEffect(mount);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
