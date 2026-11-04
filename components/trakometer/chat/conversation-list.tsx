"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHANNELS } from "@/lib/trakometer/data";
import type { ChannelId, ChatListData } from "@/lib/trakometer/types";
import { showDateAndTime } from "@/lib/utility";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock2,
  Eye,
  MapPin,
  MessageSquareText,
  Monitor,
  Reply,
  Smartphone,
  User,
  Video,
} from "lucide-react";
import type { MouseEvent } from "react";
import { type Pager } from "./chat-feed";

const DEVICE_ICONS = {
  mobile: Smartphone,
  sms: MessageSquareText,
  desktop: Monitor,
} as const;

function DeviceIcon({ device }: { device?: string }) {
  const Icon = DEVICE_ICONS[device as keyof typeof DEVICE_ICONS] ?? Monitor;
  return <Icon className="size-3.5" />;
}

interface Props {
  rows: ChatListData[];
  selected: ChatListData | null;
  channel: ChannelId;
  newestFirst: boolean;
  loading: boolean;
  error: string | null;
  pager?: Pager;
  onToggleSort: () => void;
  onOpen: (key: ChatListData, mode: "reply" | "full") => void;
}

export default function ConversationList({
  rows: data,
  channel,
  onToggleSort,
  selected,

  newestFirst,
  loading,
  error,
  pager,
  onOpen,
}: Props) {
  const chName = CHANNELS.find((c) => c.id === channel)?.label;
  const { total, limit, offset, hasNext, page, pageSize, onPage } = pager ?? {
    total: null,
    limit: 20,
    offset: null,
    hasNext: false,
    page: 0,
    pageSize: 20,
    onPage: () => {},
  };
  const circle = (
    read_status:
      | "grey_circle"
      | "green_circle"
      | "red_circle"
      | "yellow_circle",
  ) => {
    if (read_status == "grey_circle") return "text-gray-500";
    else if (read_status == "green_circle") return "text-green-300";
    else if (read_status == "red_circle") return "text-red-500";
    else if (read_status == "yellow_circle") return "text-yellow-500";
    else return "text-muted";
  };

  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-r md:flex md:max-w-sm lg:max-w-lg",
        selected?.threadid !== null ? "hidden" : "flex",
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <strong className="text-sm font-semibold">{chName}</strong>
        {total && (
          <span className="text-xs text-muted-foreground">
            {total} messages
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={onToggleSort}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ArrowUpDown className="size-3.5" />
          {newestFirst ? "Newest first" : "Oldest first"}
        </button>
      </div>
      <div key={page} className="scroll-whatsapp flex-1 overflow-y-auto">
        {data.map((t, index) => {
          const stop = (fn: () => void) => (e: MouseEvent) => {
            e.stopPropagation();
            fn();
          };
          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(t, "reply")}
              className={cn(
                "flex gap-2.5 border-b px-3 py-2.5 transition-colors hover:bg-muted/50",
                // selected?.threadid == t.threadid ? "bg-primary/5" : "",
              )}
            >
              <span className="w-6 shrink-0 self-center text-right text-xs tabular-nums text-muted-foreground">
                {(offset ?? page * pageSize) + index + 1}
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-primary">
                {t?.user1Name?.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 ">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn("truncate text-sm font-medium")}>
                    {t.user1Name}
                  </span>
                  <Badge variant="default" className="shrink-0 text-[10px]">
                    {t.ContractNo}
                  </Badge>
                </div>
                <div className=" truncate text-xs text-muted-foreground">
                  &rarr; {t.User2Name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-muted-foreground">
                  {t.icons.read_status && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="currentColor"
                      className={circle(t.icons.read_status)}
                    >
                      <circle cx="6" cy="6" r="5" />
                    </svg>
                  )}
                  {t.icons.service_video && <Video className="size-3.5" />}
                  <DeviceIcon device={t.icons.device} />
                  {t.icons.gps_connected && <MapPin className="size-3.5" />}
                  {t.icons.guest && <User className="size-3.5" />}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="text-right text-xs">
                  {/* <div className="font-semibold">{t.time}</div> */}
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Clock2 className="size-3.5" />{" "}
                    {showDateAndTime(t.notification_date)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    title="Quick reply"
                    onClick={stop(() => onOpen(t, "reply"))}
                  >
                    <Reply className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    title="Open full conversation"
                    onClick={stop(() => onOpen(t, "full"))}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {!data.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {error ??
              (loading ? "Loading chats…" : "Nothing here for this filter.")}
          </div>
        )}
      </div>
      {pager && (page > 0 || hasNext) && (
        <div className="flex items-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
          <span>
            {page * pageSize + 1}&ndash;
            {page * pageSize + data.length}
            {total !== null && ` of ${total}`}
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="icon-xs"
            title="Previous page"
            disabled={page === 0 || loading}
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span>Page {page + 1}</span>
          <Button
            variant="outline"
            size="icon-xs"
            title="Next page"
            disabled={!hasNext || loading}
            onClick={() => onPage(page + 1)}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </aside>
  );
}
