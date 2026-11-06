import { useEffect, useRef } from "react";

// SSR guard, lazy `gsap` import, and scoped cleanup — mirrors the project's
// useThreeEffect philosophy so GSAP and three.js share one mental model.
//
// `build(gsap, el, ctx)` runs after `gsap.context()`'s synchronous setup
// window has closed (plugin imports are async), so anything `build` creates
// must be wrapped in `ctx.add(() => {...})` to be tracked for cleanup.
export function useGsap(build, deps = []) {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = scopeRef.current;
    if (!el) return;

    let cancelled = false;
    let ctx;

    import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {}, el);
      build(gsap, el, ctx);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
