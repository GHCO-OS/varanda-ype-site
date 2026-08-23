import React from "react";
import { useGsap } from "./lib/useGsap.js";

// Letter-by-letter cascade on load, built with GSAP + SplitText.
//
// Deliberately renders fully visible, un-hidden text by default (no inline
// `opacity: 0`) — this heading is part of the SSR-prerendered, SEO-facing
// markup, and it must stay real content even if JS fails to load or loads
// slowly. That means there's a brief beat where the plain heading is visible
// before the split/animation takes over once the (code-split) `gsap` +
// `SplitText` chunk arrives; that small flash is the correct trade for never
// risking a permanently blank hero.
export function HeroHeadline({ as: Tag = "h1", className, children }) {
  const scopeRef = useGsap((gsap, el, ctx) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    import("gsap/SplitText").then(({ SplitText }) => {
      gsap.registerPlugin(SplitText);
      ctx.add(() => {
        const split = new SplitText(el, { type: "words,chars" });
        gsap.from(split.chars, {
          yPercent: 110,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.018,
        });

        return () => split.revert();
      });
    });
  }, []);

  return (
    <Tag ref={scopeRef} className={className}>
      {children}
    </Tag>
  );
}
