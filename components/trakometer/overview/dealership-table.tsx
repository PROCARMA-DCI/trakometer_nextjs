"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { Dealer } from "@/lib/trakometer/types";
import { fmtNum } from "@/lib/trakometer/utils";
import { cn } from "@/lib/utils";

type Key = "n" | "account" | "classic" | "com" | "exp" | "redeem" | "m" | "c";
const COLS: [Key, string, "left" | "right"][] = [
  ["n", "#", "left"],
  ["account", "Account", "left"],
  ["classic", "Classic", "right"],
  ["com", "Com", "right"],
  ["exp", "Exp", "right"],
  ["redeem", "Redeem", "right"],
  ["m", "M", "right"],
  ["c", "C", "right"],
];

export default function DealershipTable({ dealers }: { dealers: Dealer[] }) {
  const [key, setKey] = useState<Key>("account");
  const [dir, setDir] = useState(1);

  const rows = useMemo(() => {
    const r = dealers.slice();
    if (key === "n") return dir < 0 ? r.reverse() : r;
    return r.sort((a, b) => {
      const ak = a[key as keyof Dealer];
      const bk = b[key as keyof Dealer];
      return (ak > bk ? 1 : ak < bk ? -1 : 0) * dir;
    });
  }, [dealers, key, dir]);

  const sort = (k: Key) => {
    setDir(key === k ? -dir : 1);
    setKey(k);
  };

  const numCell = (v: number) => (
    <td className={cn("px-3 py-2 text-right font-mono text-sm tabular-nums", v === 0 && "text-muted-foreground/50")}>
      {fmtNum(v)}
    </td>
  );

  return (
    <div className="overflow-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-muted/60 backdrop-blur">
          <tr>
            {COLS.map(([k, label, align]) => (
              <th
                key={k}
                onClick={() => sort(k)}
                aria-sort={key === k ? (dir > 0 ? "ascending" : "descending") : "none"}
                className={cn(
                  "cursor-pointer select-none whitespace-nowrap px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground",
                  align === "right" ? "text-right" : "text-left",
                  key === k && "text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {label}
                  {key === k ? (
                    dir > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                  ) : (
                    <ChevronsUpDown className="size-3 opacity-40" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((d, i) => (
            <tr key={d.account} className="hover:bg-muted/40">
              <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
              <td className="px-3 py-2">
                <div className="font-medium">{d.account}</div>
                <div className="text-xs text-muted-foreground">{d.state}</div>
              </td>
              <td className="px-3 py-2 text-right font-mono text-sm tabular-nums">{fmtNum(d.classic)}</td>
              {numCell(d.com)}
              {numCell(d.exp)}
              <td className="px-3 py-2 text-right font-mono text-sm tabular-nums">
                {d.redeemDelta && <span className="mr-1 text-green-600 dark:text-green-400">{d.redeemDelta}</span>}
                {fmtNum(d.redeem)}
              </td>
              {numCell(d.m)}
              {numCell(d.c)}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="p-8 text-center text-sm text-muted-foreground">No accounts match this search.</div>
      )}
    </div>
  );
}
