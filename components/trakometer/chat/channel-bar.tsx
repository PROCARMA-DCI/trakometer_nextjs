"use client";

import {
  Gauge,
  Car,
  CalendarClock,
  LayoutDashboard,
  EyeOff,
  MessagesSquare,
  BellDot,
  BellRing,
  BellOff,
  Star,
  Flag,
  RefreshCw,
} from "lucide-react";
import { CHANNELS } from "@/lib/trakometer/data";
import { cn } from "@/lib/utils";
import type { AlertFilter, ChannelId } from "@/lib/trakometer/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CHANNEL_ICONS: Record<ChannelId, React.ComponentType<{ className?: string }>> = {
  ngauge: Gauge,
  trade: Car,
  service: CalendarClock,
  dash: LayoutDashboard,
  anon: EyeOff,
  kanopi: MessagesSquare,
  notif: BellDot,
};

const ALERTS: { id: Exclude<AlertFilter, null>; label: string; icon: React.ComponentType<{ className?: string }>; className: string }[] = [
  { id: "star", label: "Starred", icon: Star, className: "text-amber-500" },
  { id: "new", label: "New", icon: BellRing, className: "text-red-500" },
  { id: "flag", label: "Flagged", icon: Flag, className: "text-red-600" },
];

interface Props {
  channel: ChannelId;
  onChannel: (c: ChannelId) => void;
  push: boolean;
  onPush: () => void;
  alert: AlertFilter;
  onAlert: (a: Exclude<AlertFilter, null>) => void;
  counts: Record<"star" | "new" | "flag", number>;
  spinning: boolean;
  onRefresh: () => void;
}

export default function ChannelBar({ channel, onChannel, push, onPush, alert, onAlert, counts, spinning, onRefresh }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b bg-background px-3 py-2">
      {CHANNELS.map((c) => {
        const Icon = CHANNEL_ICONS[c.id];
        return (
          <button
            key={c.id}
            onClick={() => onChannel(c.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
              channel === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {c.label}
            {c.count !== undefined && (
              <Badge
                variant={c.count > 0 ? "destructive" : "secondary"}
                className="h-4 min-w-4 px-1 text-[10px]"
              >
                {c.count}
              </Badge>
            )}
          </button>
        );
      })}
      <button
        onClick={onPush}
        aria-pressed={push}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1.5 text-xs font-medium transition-colors",
          push ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {push ? <BellRing className="size-3.5" /> : <BellOff className="size-3.5" />}
        {push ? "Push on" : "Enable push"}
      </button>

      <div className="flex-1" />

      <div className="flex flex-wrap items-center gap-1.5">
        {ALERTS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              title={a.label}
              onClick={() => onAlert(a.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                alert === a.id ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-3.5", a.className)} />
              {a.label}
              <span className="font-mono text-muted-foreground">{counts[a.id]}</span>
            </button>
          );
        })}
        <Button variant="outline" size="icon" title="Refresh notifications" onClick={onRefresh}>
          <RefreshCw className={cn("size-4", spinning && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
