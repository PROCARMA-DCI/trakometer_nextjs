"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHANNELS } from "@/lib/trakometer/data";
import type { Pager } from "./chat-feed";
import type { ChannelId, ChatThread } from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Monitor,
  Reply,
  Smartphone,
  Star,
} from "lucide-react";
import type { MouseEvent } from "react";

interface Props {
  threads: ChatThread[];
  selected: string | null;
  read: Record<string, boolean>;
  starred: Record<string, boolean>;
  flagged: Record<string, boolean>;
  channel: ChannelId;
  newestFirst: boolean;
  loading: boolean;
  error: string | null;
  pager?: Pager;
  onToggleSort: () => void;
  onOpen: (key: string, mode: "reply" | "full") => void;
  onQuick: (key: string) => void;
}

export default function ConversationList(p: Props) {
  const chName = CHANNELS.find((c) => c.id === p.channel)?.label;
  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-r md:flex md:max-w-sm lg:max-w-lg",
        p.selected !== null ? "hidden" : "flex",
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <strong className="text-sm font-semibold">{chName}</strong>
        <span className="text-xs text-muted-foreground">
          {p.threads.length} messages
        </span>
        <div className="flex-1" />
        <button
          onClick={p.onToggleSort}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ArrowUpDown className="size-3.5" />
          {p.newestFirst ? "Newest first" : "Oldest first"}
        </button>
      </div>
      <div key={p.pager?.page} className="scroll-whatsapp flex-1 overflow-y-auto">
        {p.threads.map((t) => {
          const c = t.contact;
          const unread = t.unread && !p.read[t.key];
          const stop = (fn: () => void) => (e: MouseEvent) => {
            e.stopPropagation();
            fn();
          };
          return (
            <div
              key={t.key}
              role="button"
              tabIndex={0}
              onClick={() => p.onOpen(t.key, "reply")}
              className={cn(
                "flex gap-2.5 border-b px-3 py-2.5 transition-colors hover:bg-muted/50",
                p.selected === t.key && "bg-primary/5",
              )}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: c.bg, color: c.fg }}
              >
                {c.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {unread && (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <span
                    className={cn(
                      "truncate text-sm",
                      unread ? "font-semibold" : "font-medium",
                    )}
                  >
                    {c.name}
                  </span>
                  <Badge variant="default" className="shrink-0 text-[10px]">
                    Customer
                  </Badge>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  &rarr; {c.dealer}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-muted-foreground">
                  {t.device === "mobile" ? (
                    <Smartphone className="size-3.5" />
                  ) : (
                    <Monitor className="size-3.5" />
                  )}
                  {p.starred[t.messageId] && (
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  )}
                  {p.flagged[t.messageId] && (
                    <Flag className="size-3.5 fill-red-500 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="text-right text-xs">
                  <div className="font-semibold">{t.time}</div>
                  <div className="text-muted-foreground">{t.date}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    title="Quick reply"
                    onClick={stop(() => p.onQuick(t.key))}
                  >
                    <Reply className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    title="Open full conversation"
                    onClick={stop(() => p.onOpen(t.key, "full"))}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {!p.threads.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {p.error ?? (p.loading ? "Loading chats…" : "Nothing here for this filter.")}
          </div>
        )}
      </div>
      {p.pager && (p.pager.page > 0 || p.pager.hasNext) && (
        <div className="flex items-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
          <span>
            {p.pager.page * p.pager.pageSize + 1}&ndash;
            {p.pager.page * p.pager.pageSize + p.threads.length}
            {p.pager.total !== null && ` of ${p.pager.total}`}
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="icon-xs"
            title="Previous page"
            disabled={p.pager.page === 0 || p.loading}
            onClick={() => p.pager!.onPage(p.pager!.page - 1)}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span>Page {p.pager.page + 1}</span>
          <Button
            variant="outline"
            size="icon-xs"
            title="Next page"
            disabled={!p.pager.hasNext || p.loading}
            onClick={() => p.pager!.onPage(p.pager!.page + 1)}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </aside>
  );
}
