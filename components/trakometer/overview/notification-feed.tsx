"use client";

import { useState } from "react";
import { MessageCircle, FileBadge, X, Smartphone, Monitor } from "lucide-react";
import type { FeedItem } from "@/lib/trakometer/types";
import { CONTACTS, RECENT_USERS } from "@/lib/trakometer/data";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Filter = "All" | "Customer" | "Admin";

export default function NotificationFeed({
  feed,
  fresh,
  onDismiss,
}: {
  feed: FeedItem[];
  fresh: Record<string, boolean>;
  onDismiss: (id: string) => void;
}) {
  const [tab, setTab] = useState<"notif" | "users">("notif");
  const [filter, setFilter] = useState<Filter>("All");
  const items = feed.filter((f) => filter === "All" || f.from === filter);

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-3 border-b px-3 py-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "notif" | "users")}>
          <TabsList>
            <TabsTrigger value="notif" className="gap-1.5">
              Notifications
              {feed.length > 0 && (
                <Badge variant="destructive" className="h-4 min-w-4 px-1 text-[10px]">
                  {feed.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Recent users</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-1" />
        {tab === "notif" && (
          <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5 text-xs">
            {(["All", "Customer", "Admin"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded px-2 py-1 text-muted-foreground transition-colors",
                  filter === f && "bg-background text-foreground shadow-sm"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-h-80 divide-y overflow-y-auto">
        {tab === "notif" &&
          (items.length ? (
            items.map((f) => {
              const cust = f.from === "Customer";
              return (
                <div
                  key={f.id}
                  className={cn(
                    "flex gap-2.5 px-3 py-2.5 transition-colors",
                    fresh[f.id] && "bg-amber-50 dark:bg-amber-950/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      cust ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cust ? <MessageCircle className="size-3.5" /> : <FileBadge className="size-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="truncate text-sm font-semibold">{f.dealer}</strong>
                      <Badge variant={cust ? "default" : "secondary"} className="shrink-0 text-[10px]">
                        {f.from}
                      </Badge>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {f.text} &middot; <span className="font-mono text-primary">{f.contract}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
                    <span>
                      {f.date} &middot; {f.time}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{f.state}</span>
                      <Button variant="ghost" size="icon-xs" title="Dismiss" onClick={() => onDismiss(f.id)}>
                        <X className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">No notifications.</div>
          ))}

        {tab === "users" &&
          RECENT_USERS.map((u) => {
            const c = CONTACTS[u.key];
            return (
              <div key={u.key} className="flex items-center gap-2.5 px-3 py-2.5">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: c.bg, color: c.fg }}
                >
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-medium">{c.name}</strong>
                  <div className="truncate text-xs text-muted-foreground">{c.dealer}</div>
                </div>
                {u.device === "mobile" ? (
                  <Smartphone className="size-4 text-muted-foreground" />
                ) : (
                  <Monitor className="size-4 text-muted-foreground" />
                )}
                <span className="shrink-0 text-xs text-muted-foreground">{u.seen}</span>
              </div>
            );
          })}
      </div>
    </Card>
  );
}
