"use client";

import { CalendarClock, CheckCircle2, Flag, Star, Reply, CalendarCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact, Message } from "@/lib/trakometer/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  m: Message;
  contact: Contact;
  starred: boolean;
  flagged: boolean;
  confirmed: boolean;
  onStar: () => void;
  onFlag: () => void;
  onReply: () => void;
  onConfirm: () => void;
}

export default function AppointmentCard({ m, contact: c, starred, flagged, confirmed, onStar, onFlag, onReply, onConfirm }: Props) {
  const a = m.appt!;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border",
        confirmed ? "border-teal-300 dark:border-teal-800" : "border-border"
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 border-b px-3 py-2",
          confirmed ? "bg-teal-50 dark:bg-teal-950/40" : "bg-muted/40"
        )}
      >
        <CalendarClock className="size-4 text-teal-600 dark:text-teal-400" />
        <strong className="text-sm font-semibold">Schedule appointment</strong>
        <span className="text-xs text-muted-foreground">
          {c.name} ({c.id}) &middot; {c.dealer}
        </span>
        <div className="flex-1" />
        {confirmed && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400">
            <CheckCircle2 className="size-3.5" />
            Confirmed
          </span>
        )}
        <Button variant="ghost" size="icon-xs" title="Flag" onClick={onFlag} className={cn(flagged && "text-red-600")}>
          <Flag className={cn("size-3.5", flagged && "fill-red-600")} />
        </Button>
        <Button variant="ghost" size="icon-xs" title="Star" onClick={onStar} className={cn(starred && "text-amber-500")}>
          <Star className={cn("size-3.5", starred && "fill-amber-500")} />
        </Button>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <div className="text-sm italic text-muted-foreground">&ldquo;{m.body}&rdquo;</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border bg-muted/30 p-2">
            <div className="text-muted-foreground">Requested</div>
            <strong className="block text-sm">{a.reqDate}</strong>
            <span>{a.reqTime}</span>
          </div>
          <div className="rounded-lg border bg-muted/30 p-2">
            <div className="text-muted-foreground">Sent</div>
            <strong className="block text-sm">{m.date}</strong>
            <span>{m.time}</span>
          </div>
          <div className="rounded-lg border bg-muted/30 p-2">
            <div className="text-muted-foreground">Tel</div>
            <strong className="block text-sm">{c.phone}</strong>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {a.services.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onReply}>
            <Reply className="size-3.5" />
            Reply
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            <CalendarCheck2 className="size-3.5" />
            {confirmed ? "Update appointment" : "Confirm appointment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
