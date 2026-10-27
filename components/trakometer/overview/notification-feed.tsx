"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  DashboardMobileUser,
  DashboardNotification,
} from "@/lib/trakometer/types";
import {
  Bell,
  Car,
  MessageCircle,
  Monitor,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useState } from "react";

/** "2026-10-26 18:07:05" → ["10-26-2026", "06:07 PM"] (string-parsed, no timezone shift). */
function fmtStamp(s: string): [string, string] {
  const [d = "", t = ""] = s.split(" ");
  const [y, mo, da] = d.split("-");
  const [h = "0", mi = "00"] = t.split(":");
  const hh = Number(h);
  return [
    `${mo}-${da}-${y}`,
    `${String(hh % 12 || 12).padStart(2, "0")}:${mi} ${hh >= 12 ? "PM" : "AM"}`,
  ];
}

function timeAgo(s: string): string {
  const secs = Math.max(
    0,
    Math.floor((Date.now() - new Date(s.replace(" ", "T")).getTime()) / 1000),
  );
  if (Number.isNaN(secs)) return "";
  const part = (n: number, u: string) => `${n} ${u}${n === 1 ? "" : "s"}`;
  if (secs < 60) return `${part(secs, "second")} ago`;
  const m = Math.floor(secs / 60);
  if (m < 60) return `${part(m, "minute")}, ${part(secs % 60, "second")} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${part(h, "hour")}, ${part(m % 60, "minute")} ago`;
  return `${part(Math.floor(h / 24), "day")} ago`;
}

export default function NotificationFeed({
  notifications,
  users,
}: {
  notifications: DashboardNotification[];
  users: DashboardMobileUser[];
}) {
  const [tab, setTab] = useState<"notif" | "users">("notif");

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-3 border-b px-3 py-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "notif" | "users")}>
          <TabsList>
            <TabsTrigger value="notif" className="gap-1.5">
              Notifications
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="h-4 min-w-4 px-1 text-[10px]"
                >
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Recent users</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-h-80 divide-y overflow-y-auto">
        {tab === "notif" &&
          (notifications.length ? (
            notifications.map((n) => {
              const [date, time] = fmtStamp(n.noti_date);
              const Icon = n.noti_type === "6" ? Car : MessageCircle;
              return (
                <div
                  key={n.noti_id}
                  className="flex items-center gap-2.5 px-3 py-2.5"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">{n.noti_message}</div>
                  <div className="shrink-0 rounded bg-muted px-2 py-1 text-center text-[11px] leading-tight text-muted-foreground">
                    <div>{date}</div>
                    <div>{time}</div>
                  </div>
                  {/* Actions are not wired up yet. */}
                  <div className="flex shrink-0 items-center gap-1">
                    <XCircle className="size-4 fill-blue-500 text-white" />
                    <Bell className="size-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications.
            </div>
          ))}

        {tab === "users" &&
          (users.length ? (
            users.map((u, i) => (
              <div
                key={`${u.user_profile_name}-${u.date_added}-${i}`}
                className="flex items-center gap-2.5 px-3 py-2.5"
              >
                {/* DealerLogo / CustomerImage are partial paths until the backend sends full URLs. */}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {u.device_type === "iphone" || u.device_type === "android" ? (
                    <Smartphone className="size-4" />
                  ) : (
                    <Monitor className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-medium capitalize">
                    {u.user_profile_name.toLowerCase()}
                  </strong>
                  <span className="shrink-0 text-right text-xs text-muted-foreground">
                    {timeAgo(u.date_added)}
                  </span>
                </div>
                {u?.DealerLogo && (
                  <img
                    src={u?.DealerLogo}
                    alt="Dealer logo"
                    width={50}
                    height={50}
                    className="shrink-0 rounded-full"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No recent users.
            </div>
          ))}
      </div>
    </Card>
  );
}
