"use client";

import { Flag, Star, Reply } from "lucide-react";
import { AGENT } from "@/lib/trakometer/data";
import { cn } from "@/lib/utils";
import type { ChatMessage, Contact } from "@/lib/trakometer/types";
import { Button } from "@/components/ui/button";

interface Props {
  m: ChatMessage;
  contact: Contact;
  starred: boolean;
  flagged: boolean;
  onStar: () => void;
  onFlag: () => void;
  onReply: () => void;
}

export default function MessageBubble({ m, contact: c, starred, flagged, onStar, onFlag, onReply }: Props) {
  const cust = m.from === "cust";
  return (
    <div className={cn("flex gap-2.5", !cust && "flex-row-reverse")}>
      <span
        className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", !cust && "bg-foreground text-background")}
        style={cust ? { background: c.bg, color: c.fg } : undefined}
      >
        {cust ? c.initials : AGENT.initials}
      </span>
      <div className={cn("flex max-w-[min(560px,85%)] flex-col gap-1.5 rounded-xl border bg-card p-3", !cust && "bg-primary/5")}>
        <div className="flex flex-wrap items-center gap-1.5">
          <strong className="text-sm font-semibold">{cust ? `${c.name} (${c.id})` : AGENT.name}</strong>
          <span className="text-xs text-muted-foreground">{c.dealer}</span>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {m.date} &middot; {m.time}
          </span>
          <Button variant="ghost" size="icon-xs" title="Flag" onClick={onFlag} className={cn(flagged && "text-red-600")}>
            <Flag className={cn("size-3.5", flagged && "fill-red-600")} />
          </Button>
          <Button variant="ghost" size="icon-xs" title="Star" onClick={onStar} className={cn(starred && "text-amber-500")}>
            <Star className={cn("size-3.5", starred && "fill-amber-500")} />
          </Button>
        </div>
        <div className="whitespace-pre-line text-sm">{m.body}</div>
        <div className="flex items-center justify-end gap-1.5 pt-1">
          <Button variant="secondary" size="xs" onClick={onReply}>
            <Reply className="size-3.5" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
