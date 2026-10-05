"use client";

import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  MessagesSquare,
  Reply,
  Eye,
  Store,
  Phone,
  Mail,
} from "lucide-react";
import { CONTACTS, MESSAGES } from "@/lib/trakometer/data";
import { cn } from "@/lib/utils";
import type { ChatRow, Message, ThreadMode } from "@/lib/trakometer/types";
import MessageBubble from "./message-bubble";
import AppointmentCard from "./appointment-card";
import Composer from "./composer";

type Flags = Record<string, boolean>;
interface Props {
  row: ChatRow | null;
  mode: ThreadMode;
  onMode: (m: ThreadMode) => void;
  onBack: () => void;
  msgById: Record<string, Message>;
  extra: Message[];
  deleted: Flags;
  starred: Flags;
  flagged: Flags;
  confirmed: Flags;
  replyMsg: string | null;
  draftSeed: string;
  onStar: (id: string) => void;
  onFlag: (id: string) => void;
  onReply: (id: string) => void;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  onCancelReply: () => void;
  onSend: (contact: string, body: string, via: string) => void;
  onOpenSchedule: () => void;
}

export default function ThreadPanel(p: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowN = p.row?.n;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [rowN, p.mode]);

  if (!p.row) {
    return (
      <section className="hidden flex-1 items-center justify-center p-8 md:flex">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MessagesSquare className="size-7" />
          </div>
          <p className="text-sm text-muted-foreground">
            Pick a conversation. Use{" "}
            <Reply className="inline size-3.5 align-[-2px]" /> to reply to one
            thread, or <Eye className="inline size-3.5 align-[-2px]" /> to open
            the customer&apos;s full history.
          </p>
        </div>
      </section>
    );
  }
  const root = p.msgById[p.row.msg];
  const c = CONTACTS[root.contact];
  let list = MESSAGES.filter((m) => m.contact === root.contact)
    .concat(p.extra.filter((m) => m.contact === root.contact))
    .filter((m) => !p.deleted[m.id]);
  if (p.mode === "reply")
    list = list.filter((m) => m.id === root.id || m.replyOf === root.id);
  const target = p.replyMsg
    ? p.msgById[p.replyMsg] || p.extra.find((e) => e.id === p.replyMsg)
    : null;

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b px-2 py-2.5 sm:gap-3 sm:px-4">
        <button
          onClick={p.onBack}
          title="Back to conversations"
          className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-muted md:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ background: c.bg, color: c.fg }}
        >
          {c.initials}
        </span>
        <div className="min-w-0">
          <strong className="block truncate text-sm font-semibold">
            {c.name}
          </strong>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              Contract <span className="font-mono text-primary">{c.id}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Store className="size-3" /> {c.dealer}
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <Phone className="size-3" /> {c.phone}
            </span>
            <span className="hidden items-center gap-1 lg:inline-flex">
              <Mail className="size-3" /> {c.email}
            </span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => p.onMode("reply")}
            title="This thread"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground",
              p.mode === "reply" && "bg-background text-foreground shadow-sm",
            )}
          >
            <Reply className="size-3.5" />
            <span className="hidden sm:inline">This thread</span>
          </button>
          <button
            onClick={() => p.onMode("full")}
            title="Full history"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground",
              p.mode === "full" && "bg-background text-foreground shadow-sm",
            )}
          >
            <Eye className="size-3.5" />
            <span className="hidden sm:inline">Full history</span>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="scroll-whatsapp flex-1 space-y-4 overflow-y-auto bg-muted/20 p-3 sm:p-4"
      >
        <div className="text-xs text-muted-foreground">
          {p.mode === "reply"
            ? "Replying to one thread · open Full history to see every message"
            : `Full conversation history · ${list.length} messages`}
        </div>
        {list.map((m) =>
          m.appt ? (
            <AppointmentCard
              key={m.id}
              m={m}
              contact={c}
              starred={!!p.starred[m.id]}
              flagged={!!p.flagged[m.id]}
              confirmed={!!p.confirmed[m.id]}
              onStar={() => p.onStar(m.id)}
              onFlag={() => p.onFlag(m.id)}
              onReply={() => p.onReply(m.id)}
              onConfirm={p.onOpenSchedule}
            />
          ) : (
            <MessageBubble
              key={m.id}
              m={m}
              contact={c}
              starred={!!p.starred[m.id]}
              flagged={!!p.flagged[m.id]}
              hideTools={false}
              onStar={() => p.onStar(m.id)}
              onFlag={() => p.onFlag(m.id)}
              onReply={() => p.onReply(m.id)}
              onEdit={() => p.onEdit(m.id, m.body)}
              onDelete={() => p.onDelete(m.id)}
            />
          ),
        )}
      </div>
      {target && (
        <Composer
          key={p.row.n + ":" + (p.replyMsg ?? "") + p.draftSeed}
          replyTitle={
            target
              ? `Replying to ${target.from === "cust" ? c.name : "AIZAH AWAIS"} · ${target.time}`
              : null
          }
          initial={p.draftSeed}
          onCancelReply={p.onCancelReply}
          onSchedule={p.onOpenSchedule}
          onSend={(body, via) => p.onSend(root.contact, body, via)}
        />
      )}
    </section>
  );
}
