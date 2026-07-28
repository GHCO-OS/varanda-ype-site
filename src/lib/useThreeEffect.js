import { useEffect, useRef } from "react";

// Shared shell for every three.js decoration in this app: guards SSR/reduced-motion,
// lazy-loads `three` only in the browser, and wires cleanup. Each call site only
// supplies `mount(THREE, el)`, which builds the scene and returns its own teardown.
export function useThreeEffect(mount) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (cancelled) return;
      cleanup = mount(THREE, el);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [mount]);

  return containerRef;
}
