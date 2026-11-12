"use client";
import Table, { useTableContext } from "@/components/cui/table";
import { PageNav } from "@/components/cui/PageNav";
import { PAGE_SIZE, useChatFeed } from "@/components/trakometer/chat/chat-feed";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { ColumnType } from "@/lib/table_types";
import { viewScheduleService } from "@/lib/trakometer/chat-api";
import type {
  ScheduleServiceDetail,
  ServicePlanList,
} from "@/lib/trakometer/types";
import { showLongDateTime, showSlashDateTime } from "@/lib/utility";
import { cn } from "@/lib/utils";
import { Check, Eye, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ServiceDetailSheet } from "./service-detail-sheet";

/** `startIndex` = rows before the first loaded one, so a jump to page 2 numbers from 21. */

const actionLabelColor = (
  label: "Confirmed" | "Cancelled" | "Update Confirmed",
) => {
  if (label === "Confirmed") return "bg-green-600/80";
  if (label === "Cancelled") return "bg-destructive";
  if (label === "Update Confirmed") return "bg-blue-600/80";
  return "";
};
const makeColumns = (
  startIndex: number,
  onView: (row: ServicePlanList) => void,
): ColumnType<ServicePlanList>[] => [
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
      <button
        type="button"
        onClick={() => onView(row)}
        className="flex min-w-48 items-start gap-1.5 whitespace-normal text-left text-sky-600 hover:underline"
      >
        <Eye className="mt-0.5 size-3.5 shrink-0" />
        {showLongDateTime(row.ScheduleDateTime)}
      </button>
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
          <span
            className={cn(
              "rounded-sm px-1 text-xs text-white",
              actionLabelColor(row?.action_label),
            )}
          >
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

/** Hidden total + side rail in fullscreen (read from the Table context, so it must render inside <Table>). */
function ServicePageNav(props: {
  total: number | null;
  currentPage: number;
  onPage: (page: number) => void;
}) {
  const { fullScreen } = useTableContext();
  return (
    <PageNav
      {...props}
      pageSize={PAGE_SIZE}
      showTotal={!fullScreen}
      orientation={fullScreen ? "horizontal" : "responsive"}
    />
  );
}

export default function Page() {
  const { rows, loading, error, pager } = useChatFeed<ServicePlanList>();

  const topRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<ScheduleServiceDetail | null>(null);
  const [open, setOpen] = useState(false);
  const columns = useMemo(
    () =>
      makeColumns(pager.startIndex, async (row) => {
        const d = await viewScheduleService(row.ScheduleServiceID);
        if (!d) return;
        setDetail(d);
        setOpen(true);
      }),
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
          <ServicePageNav
            total={pager.total ?? rows.length}
            currentPage={pager.page + 1}
            onPage={(p) => {
              pager.onPage(p - 1);
              topRef.current?.scrollIntoView({ block: "start" });
            }}
          />
          <Table.Header className="min-w-0  p-2 font-semibold flex items-center">
            <Table.Density />
          </Table.Header>
        </div>
        <Table.Body />
        <LoadMore
          hasMore={pager.hasNext}
          loading={loading}
          onLoadMore={pager.onLoadMore}
        />
      </Table>
      <ServiceDetailSheet open={open} onOpenChange={setOpen} detail={detail} />
    </div>
  );
}
