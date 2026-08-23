import { useEffect, useRef } from "react";

// Mirrors useThreeEffect.js: SSR guard, lazy `gsap` import, and scoped
// cleanup, so GSAP follows the same safety rule as three.js in this app.
//
// `build(gsap, el, ctx)` is called once `gsap` has loaded. Because plugin
// imports (SplitText, ScrollTrigger) are themselves async, `build` runs
// *after* the context's own synchronous setup window has closed — so any
// gsap.to/from/timeline/ScrollTrigger call it makes must be wrapped in
// `ctx.add(() => { ... })` to be tracked for cleanup. Calls made outside
// `ctx.add` still run, they just won't be reverted on unmount.
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
