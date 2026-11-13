"use client";
import { PageNav } from "@/components/cui/PageNav";
import Table, { useTableContext } from "@/components/cui/table";
import { PAGE_SIZE, useChatFeed } from "@/components/trakometer/chat/chat-feed";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { ColumnType } from "@/lib/table_types";
import { kanopiViewThread } from "@/lib/trakometer/chat-api";
import type { KanopiThread, ScheduleChatWindow } from "@/lib/trakometer/types";
import { showDateAndTime } from "@/lib/utility";
import { cn } from "@/lib/utils";
import { Forward, Monitor, Smartphone } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ScheduleChatDialog } from "../service/schedule-chat-dialog";

const makeColumns = (
  startIndex: number,
  onOpen: (row: KanopiThread) => void,
): ColumnType<KanopiThread>[] => [
  {
    title: "#",
    render: ({ index }) => (
      <span className="tabular-nums">{startIndex + index + 1}</span>
    ),
    className: "w-12",
  },
  {
    title: "",
    className: "w-16",
    render: ({ row }) => {
      const Icon = row.device_type === "mobile" ? Smartphone : Monitor;
      return (
        <span className="flex items-center justify-center gap-1.5">
          <span
            title={row.user2read === "yes" ? "Read" : "Unread"}
            className={cn(
              "size-1.5 rounded-full",
              row.user2read === "yes" ? "bg-muted-foreground" : "bg-red-500",
            )}
          />
          <Icon className="size-4" />
        </span>
      );
    },
  },
  {
    title: "Date",
    accessor: "timestamp",
    className: "whitespace-nowrap text-center",
    render: ({ row }) => showDateAndTime(row.timestamp),
  },
  {
    title: "Message",
    accessor: "message",
    render: ({ row }) => (
      <div className="min-w-48">
        <div>
          <button
            type="button"
            onClick={() => onOpen(row)}
            className="text-sky-600 hover:underline"
          >
            {row.user1Name}
          </button>{" "}
          sent Message
        </div>
        <div className="break-words">{row.message}</div>
      </div>
    ),
  },
  {
    title: "",
    className: "w-12 text-center",
    render: ({ row }) => (
      <button
        type="button"
        title="Open conversation"
        onClick={() => onOpen(row)}
        className="text-sky-600"
      >
        <Forward className="size-4" />
      </button>
    ),
  },
];

/** Same trigger as the service page: lives inside <Table> so it knows about fullscreen. */
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
function KanopiPageNav(props: {
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
  const { rows, loading, error, pager } = useChatFeed<KanopiThread>();

  const topRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Kanopi Chat");
  const [chat, setChat] = useState<ScheduleChatWindow | null>(null);

  const load = async (threadId: number | string) => {
    const c = await kanopiViewThread(threadId);
    if (c) setChat(c);
    return c;
  };

  const columns = useMemo(
    () =>
      makeColumns(pager.startIndex, async (row) => {
        setChat(null);
        setTitle(`Kanopi Chat - ${row.user1Name} (${row.ContractNo})`);
        const c = await load(row.threadid);
        if (c) setOpen(true);
      }),
    [pager.startIndex],
  );

  return (
    <div ref={topRef} className="flex-1 lg:ml-5 lg:p-3">
      <Table<KanopiThread>
        data={rows}
        columns={columns}
        total={pager.total ?? rows.length}
        // Rows are paged by the server (jump) and appended as you scroll.
        dataLimit={Math.max(rows.length, 1)}
        currentPage={1}
        setCurrentPage={() => {}}
        rowId="message_id"
        striped
        stripedClass="bg-muted/50"
        emptyState={
          <div className="py-10 text-center text-sm text-muted-foreground">
            {error ?? (loading ? "Loading…" : "No Kanopi chats found.")}
          </div>
        }
      >
        <div className="relative flex items-center justify-between px-2 py-1.5">
          <KanopiPageNav
            total={pager.total ?? rows.length}
            currentPage={pager.page + 1}
            onPage={(p) => {
              pager.onPage(p - 1);
              topRef.current?.scrollIntoView({ block: "start" });
            }}
          />
          <Table.Header className="flex min-w-0 items-center p-2 font-semibold">
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
      <ScheduleChatDialog
        open={open}
        onOpenChange={setOpen}
        mode="view"
        title={title}
        chat={chat}
        onLoad={() => chat && load(chat.threadid)}
      />
    </div>
  );
}
