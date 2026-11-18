"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chatWindow, replyServicePlus } from "@/lib/trakometer/chat-api";
import type {
  ScheduleChatMessage,
  ServicePlanList,
} from "@/lib/trakometer/types";
import { showLongDateTime } from "@/lib/utility";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const plain = (html?: string | null) =>
  (html ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();

function ReadOnlyField({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value?: string | null;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 text-sm font-normal">{label}</Label>
      <div
        className={`flex min-h-9 items-center rounded-sm border bg-muted/30 px-3 text-sm ${valueClassName ?? ""}`}
      >
        {value}
      </div>
    </div>
  );
}

/** "Service Plus Reply": answer a schedule request (the Check action of the service table). */
export function ServiceReplyDialog({
  row,
  onClose,
  onSent,
}: {
  /** The service plan being answered; `null` = closed. */
  row: ServicePlanList | null;
  onClose: () => void;
  /** Called after the reply was sent, so the list can reload. */
  onSent: () => void;
}) {
  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        {/* Keyed by row so every request opens with a fresh form. */}
        {row && (
          <ReplyForm
            key={row.ScheduleServiceID}
            row={row}
            onSent={() => {
              onSent();
              onClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReplyForm({
  row,
  onSent,
}: {
  row: ServicePlanList;
  onSent: () => void;
}) {
  // The customer's latest message carries the phone, text and the id the reply answers.
  const [customerMsg, setCustomerMsg] = useState<ScheduleChatMessage | null>(
    null,
  );
  const [changeDate, setChangeDate] = useState("");
  const [text, setText] = useState("");
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    chatWindow(row.thread_id).then((chat) => {
      if (cancelled || !chat) return;
      const msgs = chat.messages ?? [];
      // Newest message of the thread.
      const latest = [...msgs].sort((a, b) => b.timestamp - a.timestamp)[0];
      setCustomerMsg(latest ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [row.thread_id]);

  const via = [email && "email", sms && "SMS"].filter(Boolean).join(" and ");

  const send = async () => {
    setSending(true);
    const res = await replyServicePlus({
      message_reply: text.trim(),
      message_reply_id: row.thread_id,
      message_id: customerMsg?.message_id ?? "",
      isSendSMS: sms,
      isSendEmailNow: email,
    });
    setSending(false);
    if (!res.ok) return toast.error(res.error ?? "Could not send the reply.");
    toast.success("Reply sent.");
    onSent();
  };

  return (
    <>
      <DialogHeader className="border-b px-5 py-4">
        <DialogTitle className="text-lg font-semibold text-sky-500">
          Service Plus Reply
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-x-8 gap-y-3 px-5 py-4 sm:grid-cols-2">
        <ReadOnlyField
          label="Requested Date / Time"
          value={showLongDateTime(row.ScheduleDateTime)}
          valueClassName="font-semibold text-green-500"
        />
        <div>
          <Label htmlFor="change-date" className="mb-1.5 text-sm font-normal">
            Change Date Time
          </Label>
          <Input
            id="change-date"
            type="datetime-local"
            disabled
            value={changeDate}
            onChange={(e) => setChangeDate(e.target.value)}
            className="h-9 rounded-sm"
          />
        </div>
        <ReadOnlyField label="Customer Phone" value={customerMsg?.User1Phone} />
        <ReadOnlyField label="Customer Email" value={row.CustomerEmail} />
        <ReadOnlyField
          className="sm:col-span-2"
          label="Message From Customer"
          value={plain(customerMsg?.message)}
          valueClassName="text-sky-500"
        />
        <div className="sm:col-span-2">
          <Label htmlFor="reply-text" className="mb-1.5 text-sm font-normal">
            Message to Customer
          </Label>
          <Textarea
            id="reply-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            autoFocus
            className="rounded-sm"
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        <p className="mb-5 text-xs text-sky-600">
          {via
            ? `This message will be delivered to the customer via ${via}${email ? " and to their app" : ""}.`
            : "This message will be delivered to the customer's app."}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={sms}
              onCheckedChange={(c) => setSms(Boolean(c))}
              className="size-5 rounded-full"
            />
            Send SMS
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={email}
              onCheckedChange={(c) => setEmail(Boolean(c))}
              className="size-5 rounded-full"
            />
            Send Email
          </label>
          <Button
            onClick={send}
            disabled={!text.trim() || !customerMsg || sending}
            className="h-10 min-w-56 rounded-sm bg-teal-500 text-white hover:bg-teal-600"
          >
            Send and Update
          </Button>
        </div>
      </div>
    </>
  );
}
