"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DashboardData, Dealer } from "@/lib/trakometer/types";
import { fmtNum } from "@/lib/trakometer/utils";
import { cn } from "@/lib/utils";
import { CheckSquare, Square, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePortal } from "../portal-provider";
import DealershipTable from "./dealership-table";
import NetworkMap from "./network-map";
import NotificationFeed from "./notification-feed";

type Category = DashboardData["trakoCategory"][number];

const num = (v: string | number | undefined) => Number(v) || 0;
const dirOf = (v: number) => (v > 0 ? "up" : v < 0 ? "down" : "");

export default function OverviewScreen() {
  const {
    dashboard: data,
    dashboardError: error,
    setCategoryIds,
    range,
  } = usePortal();
  const [categories, setCategories] = useState<Category[]>([]);
  // Chips = API trakoCategory. null = user hasn't touched them yet (none on,
  // sent to the API as "" = no filter).
  const [selected, setSelected] = useState<string[] | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [blink, setBlink] = useState<Record<string, boolean>>({
    OH: true,
    LA: true,
  });
  console.log({ selected });

  const categoryIds = selected?.join(",") ?? "";
  useEffect(() => setCategoryIds(categoryIds), [categoryIds, setCategoryIds]);

  // Chip list comes from the first response so it stays stable.
  if (data && !categories.length && data.trakoCategory.length)
    setCategories(data.trakoCategory);

  const isOn = (c: Category): boolean =>
    selected?.includes(c.TrakoCategoryID) ?? false;
  const toggleCategory = (id: string) => {
    const current = categories.filter(isOn).map((c) => c.TrakoCategoryID);
    setSelected(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  useEffect(() => {
    const t0 = setTimeout(() => setBlink({}), 9000);
    return () => clearTimeout(t0);
  }, []);

  const allDealers = useMemo<Dealer[]>(
    () =>
      (data?.plans ?? []).map((p) => ({
        id: p.DealerID,
        account: p.DealerTitle,
        state: "", // not part of the dashboard payload
        classic: num(p.totalContract),
        com: num(p.comp),
        exp: num(p.express),
        redeem: num(p.totalRedemtion),
        redeemDelta: "",
        m: num(p.totalMature),
        c: num(p.totalCancel),
      })),
    [data],
  );

  const dealers = useMemo(() => {
    // Search is applied server-side (DealerTitle); only the state filter is local.
    return allDealers.filter((d) => !stateFilter || d.state === stateFilter);
  }, [allDealers, stateFilter]);

  const summary = useMemo(() => {
    const t = data?.sum;
    if (!t) return [];
    return [
      { label: "Classic", v: t.TotalClasic, signed: true },
      { label: "Com", v: t.TotalComp, signed: true },
      { label: "Exp", v: t.TotalExp, signed: true },
      { label: "Redeem", v: t.TotalRedeem, signed: true },
      { label: "M", v: t.TotalMatured, signed: false },
      { label: "C", v: t.TotalCancel, signed: false },
    ].map((x) => ({
      label: x.label,
      value: (x.signed && x.v > 0 ? "+" : "") + fmtNum(x.v),
      dir: x.signed ? dirOf(x.v) : "",
    }));
  }, [data]);

  return (
    <div className="flex flex-1 flex-wrap items-start gap-4 overflow-auto p-4 lg:flex-nowrap">
      <Card className="max-h-screen w-full min-w-0 gap-3 overflow-y-auto py-4 lg:w-auto lg:flex-1">
        <CardHeader className="flex flex-row flex-wrap items-center gap-2 px-4">
          <h2 className="text-sm font-semibold">Dealership contracts</h2>
          <span className="text-xs text-muted-foreground">
            {range === "30" ? "Last 30 days" : range} &middot; {dealers.length}{" "}
            accounts
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
            {categories.map((c, index) => {
              const on = isOn(c);
              return (
                <button
                  key={index}
                  aria-pressed={on}
                  onClick={() => toggleCategory(c.TrakoCategoryID)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    on
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {on ? (
                    <CheckSquare className="size-3.5" />
                  ) : (
                    <Square className="size-3.5" />
                  )}
                  {c.TrakoCategoryName}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {summary.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border bg-muted/30 px-2.5 py-2"
              >
                <div className="text-[11px] text-muted-foreground">
                  {s.label}
                </div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 font-mono text-sm font-semibold tabular-nums",
                    s.dir === "up" && "text-green-600 dark:text-green-400",
                    s.dir === "down" && "text-red-600 dark:text-red-400",
                  )}
                >
                  {s.value}
                  {s.dir === "up" && <TrendingUp className="size-3.5" />}
                  {s.dir === "down" && <TrendingDown className="size-3.5" />}
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="rounded-lg border p-8 text-center text-sm text-destructive">
              {error}
            </div>
          ) : (
            <DealershipTable dealers={dealers} />
          )}
        </CardContent>
      </Card>

      <div className="flex w-full min-w-0 flex-col gap-4 lg:w-4/12 lg:shrink-0">
        <NotificationFeed
          notifications={data?.notifications ?? []}
          users={data?.mobileuser ?? []}
        />
        <NetworkMap
          blink={blink}
          selected={stateFilter}
          onPick={(s) => setStateFilter((cur) => (cur === s ? null : s))}
        />
      </div>
    </div>
  );
}
