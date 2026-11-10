"use client";
import Table, { useTableContext } from "@/components/cui/table";
import { PaginationNumber } from "@/components/cui/table/main/Pagination";
import { PAGE_SIZE, useChatFeed } from "@/components/trakometer/chat/chat-feed";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { ColumnType } from "@/lib/table_types";
import type { ServicePlanList } from "@/lib/trakometer/types";
import { showLongDateTime, showSlashDateTime } from "@/lib/utility";
import { Check, Eye, X } from "lucide-react";
import { useMemo, useRef } from "react";

/** `startIndex` = rows before the first loaded one, so a jump to page 2 numbers from 21. */
const makeColumns = (startIndex: number): ColumnType<ServicePlanList>[] => [
  {
    title: "#",
    render: ({ index }) => (
      <span className="tabular-nums">{startIndex + index + 1}</span>
    ),
    className: "w-12",
  },
  {
    title: "Requested Date/Time",
    accessor: "ScheduleDateTime",
    render: ({ row }) => (
      <span className="flex min-w-48 items-start gap-1.5 whitespace-normal text-sky-600">
        <Eye className="mt-0.5 size-3.5 shrink-0" />
        {showLongDateTime(row.ScheduleDateTime)}
      </span>
    ),
  },
  {
    title: "Suggest Date/Time",
    accessor: "SuggestedDateTime",
    render: ({ row }) => (
      <span className="text-sky-600">
        {showLongDateTime(row.SuggestedDateTime)}
      </span>
    ),
  },
  {
    title: "Added Date/Time",
    accessor: "CreatedDate",
    className: "text-center",
    render: ({ row }) => showSlashDateTime(row.CreatedDate),
  },
  {
    title: "Customer Name",
    accessor: "CustomerName",
    className: "text-center",
    render: ({ row }) => row.CustomerName,
  },
  {
    title: "Action",
    className: "text-center",
    render: ({ row }) => {
      if (row.action_label) {
        return (
          <span className="rounded-sm bg-destructive/80 px-1 text-xs text-white">
            {row.action_label}
          </span>
        );
      }
      if (row.can_take_action) {
        return (
          <span className="flex items-center justify-center gap-1.5 text-sky-600">
            <Check className="size-4" aria-label="Accept" />
            <X className="size-4" aria-label="Decline" />
          </span>
        );
      }
      return null;
    },
  },
];

/**
 * Infinite-scroll trigger that lives inside <Table> so it knows about fullscreen.
 * Fullscreen moves the table into a portal, leaving the page behind it empty, so a
 * sentinel outside the table would stay visible and fire on every load. In
 * fullscreen the numbered pagination is used instead.
 */
function LoadMore({
  hasMore,
  loading,
  onLoadMore,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  const { fullScreen } = useTableContext();
  const ref = useInfiniteScroll(onLoadMore, {
    enabled: hasMore && !loading && !fullScreen,
  });
  if (fullScreen || !hasMore) return null;
  return (
    <div ref={ref} className="flex items-center justify-center py-4">
      {loading && <Spinner />}
    </div>
  );
}

/** Page numbers + total. Hidden in fullscreen (read from the Table context, so it must render inside <Table>). */
function PageNav({
  total,
  currentPage,
  totalRecords,
  onPage,
}: {
  total: number | null;
  currentPage: number;
  /** Total record count; the number of pages is derived from it. */
  totalRecords: number;
  onPage: (page: number) => void;
}) {
  const { fullScreen } = useTableContext();
  if (fullScreen)
    return (
      <PaginationNumber
        currentPage={currentPage}
        setCurrentPage={onPage}
        dataLimit={PAGE_SIZE}
        total={totalRecords}
      />
    );
  return (
    <>
      Total: {total}
      <div className="lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:left-0  ">
        <PaginationNumber
          className="flex lg:flex-col  "
          currentPage={currentPage}
          setCurrentPage={onPage}
          dataLimit={PAGE_SIZE}
          total={totalRecords}
        />
      </div>
    </>
  );
}

export default function Page() {
  const { rows, loading, error, pager } = useChatFeed<ServicePlanList>();

  const topRef = useRef<HTMLDivElement>(null);
  const columns = useMemo(
    () => makeColumns(pager.startIndex),
    [pager.startIndex],
  );
  return (
    <div ref={topRef} className="flex-1 lg:p-3 lg:ml-5 ">
      <Table<ServicePlanList>
        data={rows}
        columns={columns}
        total={pager.total ?? rows.length}
        // Rows are paged by the server (jump) and appended as you scroll, so
        // the table itself shows everything it has instead of slicing pages.
        dataLimit={Math.max(rows.length, 1)}
        currentPage={1}
        setCurrentPage={() => {}}
        rowId="ScheduleServiceID"
        striped
        stripedClass="bg-muted/50"
        emptyState={
          <div className="py-10 text-center text-sm text-muted-foreground">
            {error ?? (loading ? "Loading…" : "No service plans found.")}
          </div>
        }
      >
        <div className="flex items-center justify-between  px-2 py-1.5 relative">
          <PageNav
            total={pager.total}
            currentPage={pager.page + 1}
            totalRecords={pager.total ?? rows.length}
            onPage={(p) => {
              pager.onPage(p - 1);
              topRef.current?.scrollIntoView({ block: "start" });
            }}
          />
          <Table.Header className="min-w-0  p-2 font-semibold">
            <Table.FullScreen />
          </Table.Header>
        </div>
        <Table.Body />
        <LoadMore
          hasMore={pager.hasNext}
          loading={loading}
          onLoadMore={pager.onLoadMore}
        />
      </Table>
    </div>
  );
}
