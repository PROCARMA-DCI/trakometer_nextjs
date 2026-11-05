"use client";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { ReactNode } from "react";
import { Spinner } from "../ui/spinner";

export interface InfiniteScrollProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  /** The already-rendered list; this only adds the sentinel and trailing state. */
  children: ReactNode;
  loadingIndicator?: ReactNode;
  /** Pass `null` to render nothing once the list is exhausted. */
  endMessage?: ReactNode | null;
  className?: string;
  rootMargin?: string;
}

export function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  children,
  loadingIndicator,
  endMessage,
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
      {hasMore ? (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {loading && (loadingIndicator ?? <Spinner />)}
        </div>
      ) : (
        endMessage !== null && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {endMessage ?? "No more items to show"}
          </p>
        )
      )}
    </div>
  );
}
