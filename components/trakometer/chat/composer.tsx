"use client";

import { useEffect, useRef, useState } from "react";
import { Reply, Star, MessageSquareText, CalendarPlus, Send, X } from "lucide-react";
import { CANNED } from "@/lib/trakometer/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  replyTitle: string | null;
  initial?: string;
  onCancelReply: () => void;
  onSchedule: () => void;
  onSend: (body: string, via: string) => void;
}

export default function Composer({ replyTitle, initial = "", onCancelReply, onSchedule, onSend }: Props) {
  const [draft, setDraft] = useState(initial);
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);
  const [canned, setCanned] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const append = (t: string) => setDraft((d) => (d ? d + "\n\n" : "") + t);

  useEffect(() => {
    if (replyTitle || initial) ref.current?.focus();
  }, [replyTitle, initial]);

  function send() {
    if (!draft.trim()) return;
    const via = [sms && "SMS", email && "email"].filter(Boolean).join(" + ") || "app";
    onSend(draft, "Reply sent via " + via);
    setDraft("");
  }

  return (
    <div className="relative border-t bg-background p-2 sm:p-3">
      {replyTitle && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg border-l-2 border-primary bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-primary">
          <Reply className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{replyTitle}</span>
          <button onClick={onCancelReply} title="Cancel reply" className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      )}
      {canned && (
        <div className="absolute bottom-full left-2 z-10 mb-1 flex max-h-72 w-[calc(100%-1rem)] max-w-80 flex-col gap-0.5 overflow-y-auto rounded-lg border bg-popover p-1 shadow-md sm:left-3">
          {CANNED.map((c) => (
            <button
              key={c.title}
              onClick={() => {
                setDraft(c.text);
                setCanned(false);
                ref.current?.focus();
              }}
              className="rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted"
            >
              <strong className="block">{c.title}</strong>
              <span className="block truncate text-xs text-muted-foreground">
                {c.text.length > 64 ? c.text.slice(0, 64) + "…" : c.text}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message"
          rows={1}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl bg-background"
        />
        <Button type="button" size="icon" onClick={send} disabled={!draft.trim()} title="Send" className="rounded-full">
          <Send className="size-4" />
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Button type="button" variant="ghost" size="xs" title="Canned message" onClick={() => setCanned(!canned)} aria-expanded={canned}>
          <MessageSquareText className="size-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden sm:inline">Canned</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          title="Request Google rating"
          onClick={() => append("We’d love your feedback! Please rate us on Google.")}
        >
          <Star className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Google rating</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          title="App rating"
          onClick={() => append("Enjoying the app? Tap here to leave a quick rating.")}
        >
          <Star className="size-3.5 text-amber-500" />
          <span className="hidden sm:inline">App rating</span>
        </Button>
        <Button type="button" variant="ghost" size="xs" title="Create schedule" onClick={onSchedule}>
          <CalendarPlus className="size-3.5" />
          <span className="hidden sm:inline">Schedule</span>
        </Button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">Via</span>
        <button
          onClick={() => setSms(!sms)}
          aria-pressed={sms}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
            sms ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
          )}
        >
          SMS
        </button>
        <button
          onClick={() => setEmail(!email)}
          aria-pressed={email}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
            email
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
              : "text-muted-foreground"
          )}
        >
          Email
        </button>
      </div>
    </div>
  );
}
