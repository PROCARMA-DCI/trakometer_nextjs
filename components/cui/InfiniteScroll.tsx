"use client";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { ReactNode } from "react";
import { Spinner } from "../ui/spinner";

export interface InfiniteScrollProps {
  hasMore: boolean;
  loading: boolean;
  /** Append the next page (never a page jump, which would reset the list and loop). */
  onLoadMore: () => void;
  /** The already-rendered list; this only adds the sentinel below it. */
  children: ReactNode;
  loadingIndicator?: ReactNode;
  className?: string;
  rootMargin?: string;
}

/**
 * Same behaviour as the service page's `LoadMore`: a sentinel under the list
 * that loads the next page when it nears the viewport, shows a spinner while
 * loading, and renders nothing once the list is exhausted.
 */
export function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  children,
  loadingIndicator,
  className,
  rootMargin,
}: InfiniteScrollProps) {
  const sentinelRef = useInfiniteScroll(onLoadMore, {
    enabled: hasMore && !loading,
    rootMargin,
  });

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4"
        >
          {loading && (loadingIndicator ?? <Spinner />)}
        </div>
      )}
    </div>
  );
}
