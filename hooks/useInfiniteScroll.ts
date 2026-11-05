"use client";

import { useEffect, useRef } from "react";

export interface UseInfiniteScrollOptions {
  /** Pass `hasMore && !loading` — the observer is torn down entirely while
   * false rather than just no-op'ing, so a finished list stops watching. */
  enabled?: boolean;
  /** How far before the sentinel enters the viewport to fire. */
  rootMargin?: string;
}

/** Fires `onIntersect` whenever the returned ref's element scrolls into view. */
export function useInfiniteScroll(
  onIntersect: () => void,
  { enabled = true, rootMargin = "200px" }: UseInfiniteScrollOptions = {},
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Ref, not a dependency — so an inline `onIntersect` doesn't recreate the observer.
  const onIntersectRef = useRef(onIntersect);
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  });

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
