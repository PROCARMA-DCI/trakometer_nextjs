"use client";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ScheduleServiceDetail } from "@/lib/trakometer/types";
import { chatWindow, chatWindowAll } from "@/lib/trakometer/chat-api";
import type { ScheduleChatWindow } from "@/lib/trakometer/types";
import { Clock, Eye, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { ScheduleChatDialog, type ChatMode } from "./schedule-chat-dialog";

const label = "font-semibold text-sky-500";

function Field({ name, value }: { name: string; value?: string | null }) {
  return (
    <>
      <dt className={label}>{name}</dt>
      <dd className="break-words">{value}</dd>
    </>
  );
}

export function ServiceDetailSheet({
  open,
  onOpenChange,
  detail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: ScheduleServiceDetail | null;
}) {
  const s = detail?.schedule;
  const redeemed = detail?.redeemed_services.records ?? [];
  const remaining = detail?.remaining_services.records ?? [];

  const [mode, setMode] = useState<ChatMode>("view");
  const [chat, setChat] = useState<ScheduleChatWindow | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const load = async (m: ChatMode) => {
    if (!s) return null;
    return m === "view"
      ? chatWindow(s.thread_id)
      : chatWindowAll(s.thread_id, s.ContractNo);
  };
  const openChat = async (m: ChatMode) => {
    const c = await load(m);
    if (!c) return;
    setMode(m);
    setChat(c);
    setChatOpen(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Service Details</SheetTitle>
        </SheetHeader>
        {s && (
          <SheetBody className="space-y-4 pr-1">
            <dl className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 border-b pb-3">
              <dt className={label}>Customer Message</dt>
              <dd className="break-words">{s.ScheduleDetail || "—"}</dd>
              <dt className={label}>Service Requested</dt>
              <dd className="break-words">{s.ScheduleService}</dd>
              <dt className={label}>Message</dt>
              <dd className="flex flex-wrap gap-x-5 gap-y-1 text-sky-500">
                <button
                  type="button"
                  onClick={() => openChat("view")}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <MessagesSquare className="size-4" /> View
                </button>
                <button
                  type="button"
                  onClick={() => openChat("all")}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <Eye className="size-4" /> Detail
                </button>
              </dd>
            </dl>

            <div
              className={`flex items-center justify-end gap-1 text-xs text-sky-500`}
            >
              <Clock className="size-3.5" /> {s.DaysLeft} Days Left
            </div>

            <div className="flex gap-4 border-y py-3">
              <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <Field name="Dealership" value={s.DealerTitle} />
                <Field name="Contract No." value={s.ContractNo} />
                <Field name="Customer Name" value={s.CustomerName} />
                <Field name="Expiration Date" value={s.ValidityDate} />
                <Field name="Plan Type" value={s.PlanDescription} />
                <Field name="Expiration Mileage" value={s.ValidityMileage} />
              </dl>
              {s.upload_img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.upload_img}
                  alt="Uploaded"
                  className="h-28 w-28 shrink-0 rounded object-cover"
                />
              )}
            </div>

            <section>
              <h3 className="mb-1 text-right text-xs text-muted-foreground">
                History of Services
              </h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b font-semibold">
                    <th className="py-1.5">Services</th>
                    <th>RO</th>
                    <th>Mileage</th>
                    <th>Date</th>
                    <th>Vehicles</th>
                  </tr>
                </thead>
                <tbody>
                  {redeemed.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-1.5">{r.CouponTitle}</td>
                      <td>{r.RepairOrderNo}</td>
                      <td>{r.CouponMileage}</td>
                      <td>{r.RecievedDate}</td>
                      <td>
                        <span className="rounded-sm bg-teal-500 px-1.5 py-0.5 text-xs text-white">
                          {r.VehicleTypeLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {redeemed.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">
                  {detail?.redeemed_services.message ?? "No services."}
                </p>
              )}
            </section>

            <section>
              <h3 className="mb-1 text-right text-xs text-muted-foreground">
                Remaining Services
              </h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b font-semibold">
                    <th className="w-10 py-1.5">#</th>
                    <th>Services</th>
                  </tr>
                </thead>
                <tbody>
                  {remaining.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-1.5">{r.total}</td>
                      <td>{r.CouponTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {remaining.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">
                  {detail?.remaining_services.message ?? "No services."}
                </p>
              )}
            </section>
          </SheetBody>
        )}
      </SheetContent>
      <ScheduleChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        mode={mode}
        title={
          mode === "view"
            ? "Schedule Appointment"
            : `Contract No ${s?.ContractNo ?? ""}`
        }
        chat={chat}
        onReplied={async () => setChat((await load(mode)) ?? chat)}
      />
    </Sheet>
  );
}
