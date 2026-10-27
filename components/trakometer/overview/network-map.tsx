"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TILES } from "@/lib/trakometer/data";
import type { DashboardStateNotification } from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";

export default function NetworkMap({
  states,
  selected,
  onPick,
}: {
  states: DashboardStateNotification[];
  selected: string | null;
  onPick: (s: string) => void;
}) {
  const activeStates = states.map((s) => s.StateCode);

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <h2 className="text-sm font-semibold">Network map</h2>
        <p className="text-xs text-muted-foreground">
          {activeStates.length} states with dealerships &middot; click a state
          to filter
        </p>
      </CardHeader>
      <CardContent className="px-4">
        <div
          className="mx-auto grid w-full  gap-1"
          style={{
            gridTemplateColumns: "repeat(11, minmax(0, 1fr))",
            gridTemplateRows: "repeat(8, 1fr)",
          }}
        >
          {TILES.map(([abbr, row, col]) => {
            const active = activeStates.includes(abbr);
            return (
              <button
                key={abbr}
                style={{ gridRow: row, gridColumn: col }}
                disabled={!active}
                title={
                  states.find((s) => s.StateCode === abbr)?.StateTitle ?? abbr
                }
                onClick={() => onPick(abbr)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-[4px] text-[9px] font-semibold uppercase tracking-wide transition-colors",
                  active
                    ? "cursor-pointer bg-primary/15 text-primary hover:bg-primary/25"
                    : "cursor-default bg-muted text-muted-foreground/40",
                  selected === abbr &&
                    "ring-2 ring-primary ring-offset-1 ring-offset-background",
                )}
              >
                {abbr}
              </button>
            );
          })}
        </div>
        <div className="mx-auto mt-3 flex justify-center flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <i className="size-2.5 rounded-full bg-primary" />
            Active dealerships
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="size-2.5 rounded-full bg-muted-foreground/30" />
            No coverage
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
