"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AGENT, CONTACTS } from "@/lib/trakometer/data";
import type { Message } from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";
import {
  BellRing,
  Building2,
  Clock,
  Maximize2,
  Phone,
  Send,
  Star,
} from "lucide-react";
import { useState } from "react";

interface Props {
  message: Message;
  starred: boolean;
  onStar: () => void;
  onClose: () => void;
  onOpenThread: () => void;
  onSend: (body: string, email: boolean) => void;
}

export default function QuickReplyModal({
  message: m,
  starred,
  onStar,
  onClose,
  onOpenThread,
  onSend,
}: Props) {
  const c = CONTACTS[m.contact];
  const cust = m.from === "cust";
  const [draft, setDraft] = useState("");
  const [email, setEmail] = useState(true);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="flex-row items-center justify-between gap-2 pr-6">
          <DialogTitle className="flex items-center gap-1.5">
            <BellRing className="size-4 text-primary" />
            Quick reply
          </DialogTitle>
          <Button variant="outline" size="sm" onClick={onOpenThread}>
            <Maximize2 className="size-3.5" />
            Open thread
          </Button>
        </DialogHeader>

        <div className="flex gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            style={cust ? { background: c.bg, color: c.fg } : undefined}
          >
            {cust ? c.initials : AGENT.initials}
          </span>
          <div className="flex-1 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <strong className="text-sm">
                {cust ? `${c.name} (${c.id})` : AGENT.name}
              </strong>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {m.topic || (m.appt ? "Service Plus" : "Chat")}
              </span>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="icon-xs"
                title="Star"
                onClick={onStar}
                className={cn(starred && "text-amber-500")}
              >
                <Star className={cn("size-3.5", starred && "fill-amber-500")} />
              </Button>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3" /> {c.dealer}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> {m.date} &middot; {m.time}
              </span>
            </div>
            <div className="mt-2 text-sm">{m.body}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="size-3" /> Tel {m.tel || c.phone}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-xl border bg-muted/30 p-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message here&hellip;"
            rows={4}
            autoFocus
            className="bg-background"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setEmail(!email)}
              aria-pressed={email}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium",
                email
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "text-muted-foreground",
              )}
            >
              Send email
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setDraft(
                  (d) =>
                    (d ? d + "\n\n" : "") +
                    "Enjoying the app? Tap here to leave a quick rating.",
                )
              }
            >
              <Star className="size-3.5 text-amber-500" />
              App rating
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              disabled={!draft.trim()}
              onClick={() => onSend(draft, email)}
            >
              <Send className="size-3.5" />
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
