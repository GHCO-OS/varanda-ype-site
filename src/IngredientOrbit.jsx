import React, { useEffect, useRef } from "react";

// Small line-icon badges representing the house's staples — legumes, carnes,
// frutas, drinks, refris, marmitas — kept intentionally simple since they're
// ambient decoration (aria-hidden), not functional iconography.
function PepperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4.5c1.6-1 3.4-.6 4 .6" />
      <path d="M8 7c-2.4 1.6-3.6 5-2.6 8.4 1 3.4 4.2 5 7 3.6 3.4-1.7 4.7-6.4 3-10.4-1.2-2.8-3.8-4.3-6-3.8-.7.2-1.1.7-1.4 2.2Z" />
    </svg>
  );
}

function CarrotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M9.5 4.5 11 6M14.5 4.5 13 6" />
      <path d="M8.5 8c1-1.5 2.5-2 3.5-2s2.5.5 3.5 2c1.5 2.3.6 6-1.8 10.4-.6 1.1-1.7 1.9-1.7 1.9s-1.1-.8-1.7-1.9C8.1 14 7.2 10.3 8.5 8Z" />
    </svg>
  );
}

function SkewerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <rect x="7" y="9.2" width="3.2" height="5.6" rx="1" />
      <rect x="12" y="9.2" width="3.2" height="5.6" rx="1" />
      <rect x="17" y="9.6" width="2.6" height="4.8" rx="1" />
    </svg>
  );
}

function CitrusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="5.6" />
      <line x1="12" y1="6.4" x2="12" y2="17.6" />
      <line x1="6.4" y1="12" x2="17.6" y2="12" />
      <line x1="8.4" y1="8.4" x2="15.6" y2="15.6" />
      <line x1="15.6" y1="8.4" x2="8.4" y2="15.6" />
    </svg>
  );
}

function DrinkCupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8h10l-1.2 10.4a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8L7 8Z" />
      <line x1="6" y1="8" x2="18" y2="8" />
      <line x1="14.5" y1="5" x2="12.5" y2="8" />
      <line x1="14.5" y1="5" x2="14.5" y2="3.4" />
    </svg>
  );
}

function SodaCanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7.5" y="4" width="9" height="16" rx="3" />
      <ellipse cx="12" cy="4" rx="4.5" ry="1.1" />
      <line x1="10.6" y1="3.5" x2="11.6" y2="2.4" />
      <line x1="7.5" y1="10" x2="16.5" y2="10" />
      <line x1="7.5" y1="14" x2="16.5" y2="14" />
    </svg>
  );
}

function LunchboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="16" height="10.5" rx="2.4" />
      <line x1="4" y1="12.6" x2="20" y2="12.6" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
      <path d="M9 4.5c.8.6.8 1.4 0 2M15 4.5c.8.6.8 1.4 0 2" />
    </svg>
  );
}

const ITEMS = [
  { key: "pimenta", Icon: PepperIcon, style: { top: "8%", left: "2%" }, speed: 0.4, rotate: -34, tone: "terracotta", size: 58 },
  { key: "legume", Icon: CarrotIcon, style: { top: "56%", left: "0%" }, speed: 0.22, rotate: 20, tone: "gold", size: 48 },
  { key: "espeto", Icon: SkewerIcon, style: { top: "2%", left: "46%" }, speed: 0.5, rotate: 10, tone: "burgundy", size: 64 },
  { key: "citrico", Icon: CitrusIcon, style: { top: "80%", left: "38%" }, speed: 0.3, rotate: -16, tone: "gold", size: 46 },
  { key: "drink", Icon: DrinkCupIcon, style: { top: "14%", right: "1%" }, speed: 0.34, rotate: 26, tone: "cream", size: 54 },
  { key: "refri", Icon: SodaCanIcon, style: { top: "64%", right: "3%" }, speed: 0.24, rotate: -12, tone: "terracotta", size: 48 },
  { key: "marmita", Icon: LunchboxIcon, style: { top: "88%", right: "20%" }, speed: 0.42, rotate: 8, tone: "gold", size: 54 },
];

// Ambient, scroll-linked "product accessory" chips floating around the hero —
// a food-industry riff on the Apple-style scatter of parts around a hero
// shot. A single rAF loop writes one CSS custom property (--t = scroll
// progress through the hero); every chip's drift/rotation/fade reads that
// var in CSS, so per-frame work stays on the GPU instead of touching N
// inline styles a frame.
export function IngredientOrbit({ className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = containerRef.current;
    if (!el) return;

    let frameId;
    let ticking = false;

    function update() {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      if (!total) return;
      const t = Math.min(Math.max((window.innerHeight - rect.top) / total, 0), 1);
      if (!Number.isFinite(t)) return;
      el.style.setProperty("--t", t.toFixed(4));
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(update);
    }

    frameId = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className={`ingredient-orbit${className ? ` ${className}` : ""}`} ref={containerRef} aria-hidden="true">
      {ITEMS.map(({ key, Icon, style, speed, rotate, tone, size }) => (
        <span
          key={key}
          className={`ingredient-chip ingredient-${tone}`}
          style={{ ...style, "--speed": speed, "--rotate": rotate, width: size, height: size }}
        >
          <Icon />
        </span>
      ))}
    </div>
  );
}
