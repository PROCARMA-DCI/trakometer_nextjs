"use client";

import { cn } from "@/lib/utils";
import { PaginationNumber } from "./table/main/Pagination";

export interface PageNavProps {
  /** Total record count (the number of pages is derived from it). `null` = unknown. */
  total: number | null;
  /** 1-based current page. */
  currentPage: number;
  /** Called with the 1-based page the user picked. */
  onPage: (page: number) => void;
  /** Rows per page; must match what the server pages by. */
  pageSize?: number;
  /**
   * `horizontal`: one row, in place.
   * `vertical`: one column, pinned to the left edge (from `lg` up).
   * `responsive`: row on small screens, `vertical` from `lg` up.
   */
  orientation?: "horizontal" | "vertical" | "responsive";
  /** Show the "Total: n" label before the page buttons. */
  showTotal?: boolean;
  className?: string;
}

const ORIENTATION = {
  horizontal: "flex-row",
  vertical: "flex-col",
  responsive: "flex-row lg:flex-col",
} as const;

/**
 * Page numbers + total, with the pagination buttons laid out in the requested
 * orientation. Page buttons only appear when there is more than one page of data.
 * Independent of any table, so it can be used next to lists, grids, etc.
 */
export function PageNav({
  total,
  currentPage,
  onPage,
  pageSize = 20,
  orientation = "horizontal",
  showTotal = true,
  className,
}: PageNavProps) {
  // A column floats at the left edge; a row stays in the flow.
  const floating = orientation !== "horizontal";
  const hasPages = total !== null && total > pageSize;
  if (!showTotal && !hasPages) return null;

  const buttons = hasPages && (
    <PaginationNumber
      className={cn(
        "flex",
        // PaginationNumber defaults to justify-end; keep columns centred.
        orientation === "horizontal" ? "justify-end" : "justify-center",
        ORIENTATION[orientation],
      )}
      currentPage={currentPage}
      setCurrentPage={onPage}
      dataLimit={pageSize}
      total={total}
    />
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {showTotal && (
        <span className="shrink-0 text-sm font-bold">Total: {total ?? 0}</span>
      )}
      {floating ? (
        <div className="lg:fixed lg:top-1/2 lg:left-0 lg:-translate-y-1/2">
          {buttons}
        </div>
      ) : (
        buttons
      )}
    </div>
  );
}
