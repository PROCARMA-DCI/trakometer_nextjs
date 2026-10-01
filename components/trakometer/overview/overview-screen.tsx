"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckSquare, Square, TrendingUp, TrendingDown, X } from "lucide-react";
import { usePortal } from "../portal-provider";
import DealershipTable from "./dealership-table";
import NotificationFeed from "./notification-feed";
import NetworkMap from "./network-map";
import { DEALERS, DEMO_INCOMING, INITIAL_FEED, PROGRAMS, SUMMARY } from "@/lib/trakometer/data";
import { fmtTime } from "@/lib/trakometer/utils";
import type { FeedItem } from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BLINK_MS = 8000;

export default function OverviewScreen() {
  const { search, range } = usePortal();
  const [programs, setPrograms] = useState<Record<string, boolean>>({
    Maintenance: true,
    Loyalty: true,
    GPS: true,
    "GPS (App Only)": false,
  });
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [blink, setBlink] = useState<Record<string, boolean>>({ OH: true, LA: true });
  const [fresh, setFresh] = useState<Record<string, boolean>>({});
  const idx = useRef(0);

  const pushNotification = useCallback((item: FeedItem) => {
    setFeed((f) => [item, ...f]);
    setBlink((b) => ({ ...b, [item.state]: true }));
    setFresh((f) => ({ ...f, [item.id]: true }));
    setTimeout(() => {
      setBlink((b) => {
        const n = { ...b };
        delete n[item.state];
        return n;
      });
      setFresh((f) => {
        const n = { ...f };
        delete n[item.id];
        return n;
      });
    }, BLINK_MS);
  }, []);

  // Stand-in for a realtime source (websocket / SSE / polling) — call pushNotification(item) per event.
  useEffect(() => {
    const t0 = setTimeout(() => setBlink({}), 9000);
    const iv = setInterval(() => {
      const src = DEMO_INCOMING[idx.current++ % DEMO_INCOMING.length];
      pushNotification({ ...src, id: "n" + Date.now(), date: "09-25-2026", time: fmtTime(new Date()) });
    }, 7000);
    return () => {
      clearTimeout(t0);
      clearInterval(iv);
    };
  }, [pushNotification]);

  const dealers = useMemo(() => {
    const s = search.trim().toLowerCase();
    return DEALERS.filter((d) => (!s || d.account.toLowerCase().includes(s)) && (!stateFilter || d.state === stateFilter));
  }, [search, stateFilter]);

  return (
    <div className="grid flex-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="gap-3 py-4">
        <CardHeader className="flex flex-row flex-wrap items-center gap-2 px-4">
          <h2 className="text-sm font-semibold">Dealership contracts</h2>
          <span className="text-xs text-muted-foreground">
            {range === "30 DAY" ? "Last 30 days" : range} &middot; {dealers.length} accounts
          </span>
          <div className="flex-1" />
          {stateFilter && (
            <Badge
              variant="outline"
              className="cursor-pointer gap-1 border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
              onClick={() => setStateFilter(null)}
            >
              State: {stateFilter}
              <X className="size-3" />
            </Badge>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-3 px-4">
          <div className="flex flex-wrap gap-1.5">
            {PROGRAMS.map((p) => (
              <button
                key={p}
                aria-pressed={programs[p]}
                onClick={() => setPrograms((x) => ({ ...x, [p]: !x[p] }))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  programs[p]
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {programs[p] ? <CheckSquare className="size-3.5" /> : <Square className="size-3.5" />}
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SUMMARY.map((s) => (
              <div key={s.label} className="rounded-lg border bg-muted/30 px-2.5 py-2">
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 font-mono text-sm font-semibold tabular-nums",
                    s.dir === "up" && "text-green-600 dark:text-green-400",
                    s.dir === "down" && "text-red-600 dark:text-red-400"
                  )}
                >
                  {s.value}
                  {s.dir === "up" && <TrendingUp className="size-3.5" />}
                  {s.dir === "down" && <TrendingDown className="size-3.5" />}
                </div>
              </div>
            ))}
          </div>

          <DealershipTable dealers={dealers} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <NotificationFeed feed={feed} fresh={fresh} onDismiss={(id) => setFeed((f) => f.filter((x) => x.id !== id))} />
        <NetworkMap blink={blink} selected={stateFilter} onPick={(s) => setStateFilter((cur) => (cur === s ? null : s))} />
      </div>
    </div>
  );
}
