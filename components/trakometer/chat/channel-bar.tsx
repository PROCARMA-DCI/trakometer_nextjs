"use client";

import { Button } from "@/components/ui/button";
import { CHANNELS, alertForPath } from "@/lib/trakometer/data";
import type { AlertFilter, ChannelId } from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";
import {
  BellDot,
  BellRing,
  CalendarClock,
  Car,
  EyeOff,
  Flag,
  Gauge,
  MessagesSquare,
  RefreshCw,
  Star,
} from "lucide-react";
import type { ChatCounts } from "./ChatLayout";
import { usePathname, useRouter } from "next/navigation";

const CHANNEL_ICONS: Record<
  ChannelId,
  React.ComponentType<{ className?: string }>
> = {
  ngauge: Gauge,
  trade: Car,
  service: CalendarClock,
  anonymous: EyeOff,
  kanopi: MessagesSquare,
  notification: BellDot,
  favourite: Star,
  flag: Flag,
};

/** Channel → key in the notification API's `counts`. Others show no badge. */
const COUNT_KEYS: Partial<Record<ChannelId, string>> = {
  notification: "unread_notifications",
  anonymous: "anonymous_notifications",
  kanopi: "kanopi_mobile_unread",
};

const ALERTS: {
  id: Exclude<AlertFilter, null>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  link: string;
}[] = [
  {
    id: "star",
    label: "Starred",
    icon: Star,
    className: "text-amber-500",
    link: "/favourite",
  },
  {
    id: "new",
    label: "New",
    icon: BellRing,
    className: "text-red-500",
    link: "/notification",
  },
  {
    id: "flag",
    label: "Flagged",
    icon: Flag,
    className: "text-red-600",
    link: "/flag",
  },
];

interface Props {
  channel: ChannelId;
  /** Badge numbers; none given → no badges. */
  counts?: ChatCounts;
  push: boolean;
  onPush: () => void;
  alert: AlertFilter;
  onAlert: (a: Exclude<AlertFilter, null>) => void;
  // counts: Record<"star" | "new" | "flag", number>;
  spinning: boolean;
  onRefresh: () => void;
}

export default function ChannelBar({
  channel,
  counts,
  push,
  onPush,
  alert,
  onAlert,
  // counts,
  spinning,
  onRefresh,
}: Props) {
  const router = useRouter();
  const activeAlert = alertForPath(usePathname())?.id ?? alert;
  return (
    <div className="flex flex-col gap-1.5 border-b bg-background px-3 py-2 md:flex-row md:flex-wrap md:items-center">
      <div className="scroll-whatsapp -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:p-0">
        {CHANNELS.map((c) => {
          const Icon = CHANNEL_ICONS[c.id];
          const key = COUNT_KEYS[c.id];
          const badge = key && counts ? Number(counts[key] ?? 0) : null;
          return (
            <button
              key={c.id}
              onClick={() => {
                router.push(c.link);
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
                channel === c.id && !activeAlert
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {c.label}
              {badge !== null && (
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-[10px] font-semibold leading-5 text-white",
                    badge > 0 ? "bg-red-500" : "bg-muted-foreground/60",
                  )}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="hidden flex-1 md:block" />

      <div className="flex flex-wrap items-center gap-1.5">
        {ALERTS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              title={a.label}
              onClick={() => router.push(a.link)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                activeAlert === a.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-3.5", a.className)} />
              {a.label}
              <span className="font-mono text-muted-foreground">
                {/* {counts[a.id]} */}
              </span>
            </button>
          );
        })}
        <Button
          variant="outline"
          size="icon"
          title="Refresh Data"
          onClick={onRefresh}
        >
          <RefreshCw className={cn("size-4", spinning && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
