// Shared render-loop glue for decorative three.js scenes: pauses when the
// container scrolls off-screen or the tab is backgrounded, and keeps the
// camera/renderer in sync with the container's actual size (not the window's,
// so effects behave correctly inside flexible grid cells at any breakpoint).
export function createLoop({ el, onFrame, onResize, render }) {
  let frameId;
  let inView = true;

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
  });
  intersectionObserver.observe(el);

  function tick() {
    frameId = requestAnimationFrame(tick);
    if (!inView || document.hidden) return;
    onFrame();
    render();
  }
  tick();

  const resizeObserver = new ResizeObserver(() => {
    const width = el.clientWidth;
    const height = el.clientHeight;
    if (width === 0 || height === 0) return;
    onResize(width, height);
  });
  resizeObserver.observe(el);

  return () => {
    cancelAnimationFrame(frameId);
    intersectionObserver.disconnect();
    resizeObserver.disconnect();
  };
}
