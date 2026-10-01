"use client";

import type { MouseEvent } from "react";
import {
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Smartphone,
  Monitor,
  MapPin,
  Star,
  Flag,
} from "lucide-react";
import { AGENT, CHANNELS, CONTACTS } from "@/lib/trakometer/data";
import { cn } from "@/lib/utils";
import type { ChannelId, ChatRow, Message } from "@/lib/trakometer/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  rows: ChatRow[];
  msgById: Record<string, Message>;
  selected: number | null;
  read: Record<number, boolean>;
  starred: Record<string, boolean>;
  flagged: Record<string, boolean>;
  confirmed: Record<string, boolean>;
  channel: ChannelId;
  newestFirst: boolean;
  onToggleSort: () => void;
  onOpen: (n: number) => void;
  onConfirm: (n: number) => void;
  onDecline: (n: number) => void;
}

export default function ConversationList(p: Props) {
  const chName = CHANNELS.find((c) => c.id === p.channel)?.label;
  return (
    <aside className={cn("w-full shrink-0 flex-col border-r md:flex md:max-w-sm", p.selected !== null ? "hidden" : "flex")}>
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <strong className="text-sm font-semibold">{chName}</strong>
        <span className="text-xs text-muted-foreground">{p.rows.length} messages</span>
        <div className="flex-1" />
        <button
          onClick={p.onToggleSort}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ArrowUpDown className="size-3.5" />
          {p.newestFirst ? "Newest first" : "Oldest first"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {p.rows.map((r) => {
          const m = p.msgById[r.msg];
          const c = CONTACTS[m.contact];
          const cust = m.from === "cust";
          const unread = !!r.unread && !p.read[r.n];
          const conf = p.confirmed[r.msg];
          const stop = (fn: () => void) => (e: MouseEvent) => {
            e.stopPropagation();
            fn();
          };
          return (
            <div
              key={r.n}
              role="button"
              tabIndex={0}
              onClick={() => p.onOpen(r.n)}
              className={cn(
                "flex cursor-pointer gap-2.5 border-b px-3 py-2.5 transition-colors hover:bg-muted/50",
                p.selected === r.n && "bg-primary/5"
              )}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={cust ? { background: c.bg, color: c.fg } : { background: "var(--foreground)", color: "var(--background)" }}
              >
                {cust ? c.initials : AGENT.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                  <span className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>
                    {cust ? c.name : AGENT.name}
                  </span>
                  <Badge variant={cust ? "default" : "secondary"} className="shrink-0 text-[10px]">
                    {cust ? "Customer" : "CES"}
                  </Badge>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  &rarr; {cust ? c.dealer : `${c.name} (${c.id})`}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-muted-foreground">
                  {r.device === "mobile" ? <Smartphone className="size-3.5" /> : <Monitor className="size-3.5" />}
                  {r.g && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
                      G
                    </span>
                  )}
                  {r.pin && <MapPin className="size-3.5 text-primary" />}
                  {r.appt && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        conf
                          ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                          : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      )}
                    >
                      {conf ? "Confirmed" : "Appointment"}
                    </Badge>
                  )}
                  {p.starred[r.msg] && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                  {p.flagged[r.msg] && <Flag className="size-3.5 fill-red-500 text-red-500" />}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="text-right text-xs">
                  <div className="font-semibold">{r.time}</div>
                  <div className="text-muted-foreground">{r.date}</div>
                </div>
                <div className="flex items-center gap-1">
                  {r.appt && (
                    <>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        title="Confirm appointment"
                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400"
                        onClick={stop(() => p.onConfirm(r.n))}
                      >
                        <CheckCircle2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        title="Decline appointment"
                        className="text-destructive hover:text-destructive"
                        onClick={stop(() => p.onDecline(r.n))}
                      >
                        <XCircle className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!p.rows.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">Nothing here for this filter.</div>
        )}
      </div>
    </aside>
  );
}
