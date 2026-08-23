import React from "react";
import { useGsap } from "./lib/useGsap.js";

// Pointer-follow lift with a soft snap-back on primary CTAs. Only active on
// real pointer devices (mouse/trackpad) — on touch it's meaningless and would
// just add listener overhead for no visible effect.
export function MagneticButton({ as: Tag = "a", className, children, ...rest }) {
  const scopeRef = useGsap((gsap, el, ctx) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ctx.add(() => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

      function onMove(event) {
        const rect = el.getBoundingClientRect();
        xTo((event.clientX - (rect.left + rect.width / 2)) * 0.3);
        yTo((event.clientY - (rect.top + rect.height / 2)) * 0.3);
      }
      function onLeave() {
        xTo(0);
        yTo(0);
      }

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });
  }, []);

  return (
    <Tag ref={scopeRef} className={className} {...rest}>
      {children}
    </Tag>
  );
}
