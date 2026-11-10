"use client";
import { InfiniteScroll } from "@/components/cui/InfiniteScroll";
import Table from "@/components/cui/table";
import { useChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ColumnType } from "@/lib/table_types";
import type { ServicePlanList } from "@/lib/trakometer/types";
import { showLongDateTime, showSlashDateTime } from "@/lib/utility";
import { Check, Eye, X } from "lucide-react";

const columns: ColumnType<ServicePlanList>[] = [
  {
    title: "#",
    render: ({ index }) => <span className="tabular-nums">{index + 1}</span>,
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

export default function Page() {
  const { rows, loading, error, pager } = useChatFeed<ServicePlanList>();

  return (
    <div className=" min-h-0 flex-1  p-3 sm:p-4">
      <InfiniteScroll
        hasMore={pager.hasNext}
        loading={loading}
        onLoadMore={() => pager.onPage(pager.page + 1)}
        endMessage={null}
      >
        <Table<ServicePlanList>
          data={rows}
          columns={columns}
          total={pager.total ?? rows.length}
          // Rows are paged by the server and appended as you scroll, so the
          // table itself shows everything it has instead of slicing pages.
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
          <Table.Body />
        </Table>
      </InfiniteScroll>
    </div>
  );
}
