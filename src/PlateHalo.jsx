import React from "react";
import { useThreeEffect } from "./lib/useThreeEffect.js";
import { createLoop } from "./lib/threeLoop.js";

function mountHaloScene(THREE, el) {
  const width = el.clientWidth;
  const height = el.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
  camera.position.set(0, 1.1, 5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  el.appendChild(renderer.domElement);

  const key = new THREE.DirectionalLight(0xf4eed7, 1.5);
  key.position.set(3, 4, 2);
  scene.add(key, new THREE.AmbientLight(0x0e351b, 0.7));

  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.05, 24, 96),
    new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 0.5, roughness: 0.3 }),
  );
  const ringInner = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.025, 16, 96),
    new THREE.MeshStandardMaterial({ color: 0xf4eed7, metalness: 0.2, roughness: 0.5, transparent: true, opacity: 0.55 }),
  );
  group.add(ring, ringInner);
  group.rotation.x = Math.PI / 2.3;
  scene.add(group);

  const stopLoop = createLoop({
    el,
    // Slow, unhurried rotation — matches the brand's "sem pressa" pacing,
    // not a spinner or an attention-grabbing loop.
    onFrame: () => {
      group.rotation.z += 0.0022;
    },
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
    ring.geometry.dispose();
    ring.material.dispose();
    ringInner.geometry.dispose();
    ringInner.material.dispose();
    if (renderer.domElement.parentNode === el) {
      el.removeChild(renderer.domElement);
    }
  };
}

export function PlateHalo({ className }) {
  const containerRef = useThreeEffect(mountHaloScene);
  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
