"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Lazy loading: mounts its children (e.g. a dynamically imported <Canvas>) only
 * when the container scrolls near the viewport, and shows `fallback` until then.
 */
export default function LazyCanvas({ children, fallback, rootMargin = "200px", className }: { children: ReactNode; fallback?: ReactNode; rootMargin?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
