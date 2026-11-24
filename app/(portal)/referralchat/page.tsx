"use client";
import { PageNav } from "@/components/cui/PageNav";
import { SearchSelectField } from "@/components/cui/SearchSelectField";
import { SimpleSelectField } from "@/components/cui/SimpleSelectField";
import { usePortal } from "@/components/trakometer/portal-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetching } from "@/lib/api/client";
import type { ReferralDay, ReferralMessage } from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, Monitor, Search, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { ReferralDetailDialog } from "./detail-dialog";

const PAGE_SIZE = 20;
const RANGES = ["ITD", "YTD", "MTD"] as const;
type Range = (typeof RANGES)[number] | "";

/** <input type=date> gives yyyy-mm-dd; the API (like the old portal) uses mm/dd/yyyy. */
const toApiDate = (v?: string) => {
  if (!v) return undefined;
  const [y, m, d] = v.split("-");
  return y && m && d ? `${m}/${d}/${y}` : "";
};

/** Values are provisional — the backend dev will confirm them. "" = all types. */
const MESSAGE_TYPES = [
  { value: "", label: "All types" },
  { value: 1, label: "Customer" },
  { value: 2, label: "Super Admin" },
];

interface Filters {
  range: Range;
  messageType?: number;
  dealerId?: string;
  from?: string;
  to?: string;
}

export default function ReferralChatPage() {
  const { unauthorized } = usePortal();
  // `draft` = what the form shows; `applied` = what was last sent (Search / range click).
  const [draft, setDraft] = useState<Filters>({
    range: "YTD",
  });
  const [applied, setApplied] = useState<Filters>(draft);
  const [page, setPage] = useState(1);
  const [days, setDays] = useState<ReferralDay[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<ReferralMessage | null>(null);
  const [dealers, setDealers] = useState<{ value: string; label: string }[]>([
    { value: "", label: "All dealers" },
  ]);

  useEffect(() => {
    (async () => {
      const res = await fetching<{
        data?: { dealers?: { DealerID: string; DealerTitle: string }[] };
      }>({
        url: "/api/ReferalChat/dealesList",
        showLoader: false,
      });
      if (!res.ok) return;
      setDealers([
        { value: "", label: "All dealers" },
        ...(res.data?.dealers ?? []).map((d) => ({
          value: String(d.DealerID),
          label: d.DealerTitle,
        })),
      ]);
    })();
  }, []);

  // StrictMode (dev) runs the effect twice; both runs share one in-flight request.

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const key = JSON.stringify({ applied, page });

      const req = fetching({
        url: "/api/ReferalChat/referalChatList",
        showLoader: true,
        badgeLoading: "Referral List Loading",
        body: {
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          message_type: applied?.messageType,
          // Param name is assumed — confirm with the backend dev.
          dealer_id: applied.dealerId || undefined,
          FixedDateParameterNotification: applied.range,
          date_from_notification: toApiDate(applied?.from),
          date_to_notification: toApiDate(applied?.to),
          // Custom dates replace the fixed range (assumed meaning of reset_fixedDate).
          reset_fixedDate: applied.from || applied.to ? 1 : undefined,
        },
      });

      const res = await req;
      if (cancelled) return;
      setLoading(false);
      if (res.status === 401 || res.status === 403) {
        unauthorized(res.message);
        return;
      }
      if (!res.ok || res.success === false) {
        setDays([]);
        setError(res.message ?? "Could not load referral chats.");
        return;
      }
      setError(null);
      setDays((res.data?.grouped_msgs ?? []) as ReferralDay[]);
      setTotal(Number(res.data?.msgs_count ?? 0));
    })();
    return () => {
      cancelled = true;
    };
  }, [applied, page, unauthorized]);

  const apply = (next: Filters) => {
    setDraft(next);
    setApplied(next);
    setPage(1);
  };
  const pickRange = (r: Range) =>
    apply({ ...draft, range: r, from: "", to: "" });
  const search = () =>
    apply({ ...draft, range: draft.from || draft.to ? "" : draft.range });

  const toggleOpen = (id: number) =>
    setOpenIds((s) => {
      const n = new Set(s);
      if (!n.delete(id)) n.add(id);
      return n;
    });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-3 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Chat</h1>
          <p className="text-sm text-muted-foreground">
            Referral chat messages, grouped by day.
          </p>
        </div>
        <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium">
          <b>{total}</b> messages
        </span>
      </div>

      {/* Filters */}
      <form
        className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SearchSelectField
            label="Dealer"
            wrapperClassName="text-xs font-medium text-muted-foreground"
            className="h-9 text-foreground"
            options={dealers}
            placeholder="Select dealer"
            value={draft.dealerId ?? ""}
            onChange={(v) => setDraft({ ...draft, dealerId: v || undefined })}
          />
          <SimpleSelectField
            label="Message type"
            wrapperClassName="text-xs font-medium text-muted-foreground"
            className="h-9 text-foreground"
            options={MESSAGE_TYPES}
            placeholder="Select message type"
            value={draft.messageType ?? ""}
            onChange={(v) =>
              setDraft({ ...draft, messageType: v ? Number(v) : undefined })
            }
          />
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            From
            <Input
              type="date"
              className="h-9"
              value={draft.from}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            To
            <Input
              type="date"
              className="h-9"
              value={draft.to}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-lg border p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => pickRange(r)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                  draft.range === r &&
                    "bg-primary text-primary-foreground hover:text-primary-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button type="submit" size="sm" className="h-9 px-4">
              <Search /> Search
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Day groups */}
      <div className={cn("flex flex-col gap-3", loading && "opacity-60")}>
        {!loading && !error && days.length === 0 && (
          <p className="rounded-xl border bg-background py-10 text-center text-sm text-muted-foreground">
            No referral messages for this selection.
          </p>
        )}
        {days.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            openIds={openIds}
            onToggle={toggleOpen}
            onDetail={setDetail}
          />
        ))}
      </div>

      <PageNav
        total={total}
        currentPage={page}
        onPage={setPage}
        pageSize={PAGE_SIZE}
        orientation="horizontal"
        className="justify-center"
      />

      <ReferralDetailDialog message={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function DayCard({
  day,
  openIds,
  onToggle,
  onDetail,
}: {
  day: ReferralDay;
  openIds: Set<number>;
  onToggle: (id: number) => void;
  onDetail: (m: ReferralMessage) => void;
}) {
  const count = day.notifications.length;
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border bg-background sm:flex-row">
      {/* Calendar-style date block */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-muted/40 p-3 sm:w-36 sm:flex-col sm:justify-center sm:border-b-0 sm:border-r">
        <div className="w-14 overflow-hidden rounded-md border bg-background text-center shadow-sm">
          <div className="bg-primary py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            {day.month.slice(0, 3)}
          </div>
          <div className="text-xl font-bold leading-tight">{day.day}</div>
        </div>
        <div className="flex flex-col sm:items-center">
          {day.date_label && (
            <span className="text-xs font-semibold text-primary">
              {day.date_label}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {count} {count === 1 ? "message" : "messages"}
          </span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 divide-y">
        {day.notifications.map((m) => {
          const open = openIds.has(m.message_id);
          const unread = m.icons?.read_status === "red_circle";
          const Device = m.device_type === "mobile" ? Smartphone : Monitor;
          return (
            <li key={m.message_id} className="px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:flex-nowrap">
                <span
                  title={unread ? "Unread" : "Read"}
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    unread ? "bg-red-500" : "bg-muted-foreground/40",
                  )}
                />
                <Device className="size-4 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1 basis-60 text-sm">
                  <span className="font-medium text-sky-600">
                    {m.user1Name}
                  </span>
                  {m.ContractNo && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({m.ContractNo})
                    </span>
                  )}{" "}
                  sent a message to{" "}
                  <span className="font-medium text-sky-600">
                    {m.User2Name}
                  </span>
                </p>
                <span className="inline-flex shrink-0 items-center gap-1 rounded bg-sky-700 px-2 py-0.5 text-xs font-medium text-white">
                  <Clock className="size-3" />
                  {m.message_time}
                </span>
                {/* working on this later */}
                {/* <Button
                  variant="outline"
                  size="icon-sm"
                  title="Preview message"
                  aria-expanded={open}
                  onClick={() => onToggle(m.message_id)}
                >
                  <Eye />
                </Button> */}
                <Button
                  size="sm"
                  className="h-7 bg-green-600 px-2 text-xs hover:bg-green-700"
                  onClick={() => onDetail(m)}
                >
                  Detail <ChevronRight />
                </Button>
              </div>
              {open && (
                <p className="mt-2 rounded-md bg-muted/60 px-3 py-2 text-sm">
                  {m.message}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
