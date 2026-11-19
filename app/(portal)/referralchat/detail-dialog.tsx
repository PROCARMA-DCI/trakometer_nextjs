"use client";
import { usePortal } from "@/components/trakometer/portal-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fetching } from "@/lib/api/client";
import type {
  ReferralDetail,
  ReferralMessage,
  ReferralThread,
  ReferralThreadMessage,
} from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, Loader2, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Detail view of one list row: customer summary + every thread for that contract. */
export function ReferralDetailDialog({
  message,
  onClose,
}: {
  message: ReferralMessage | null;
  onClose: () => void;
}) {
  const { unauthorized } = usePortal();
  const [detail, setDetail] = useState<ReferralDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Bumped after a reply to refetch the threads without blanking the dialog.
  const [reload, setReload] = useState({ id: 0, n: 0 });

  const contractNo = message?.ContractNo ?? "";
  const isGuest = Number(message?.IsGuest ?? 0);

  useEffect(() => {
    if (!message) return;
    let cancelled = false;
    const silent = reload.id === message.message_id && reload.n > 0;
    (async () => {
      if (!silent) {
        setDetail(null);
        setLoading(true);
      }
      setError(null);
      const res = await fetching({
        url: "/api/ReferalChat/viewDetailThreadMsg",
        showLoader: false,
        body: { ContractNo: contractNo, IsGuest: isGuest },
      });
      if (cancelled) return;
      setLoading(false);
      if (res.status === 401 || res.status === 403) {
        onClose();
        unauthorized(res.message);
        return;
      }
      if (!res.ok || res.success === false) {
        setError(res.message ?? "Could not load the conversation.");
        return;
      }
      setDetail(res.data as ReferralDetail);
    })();
    return () => {
      cancelled = true;
    };
    // Only a different row should refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.message_id, reload]);

  const c = detail?.customer;
  return (
    <Dialog open={!!message} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-3 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-normal">
            Contract No.{" "}
            <span className="font-semibold text-green-600">{contractNo}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Scroller is a plain block; the inner column sizes to its content, so nothing is squeezed. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {loading && (
              <div className="flex justify-center py-10 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {c && (
              <div className="grid gap-x-4 gap-y-1 shrink-0 rounded-lg border bg-muted/40 p-3 text-xs sm:grid-cols-2">
                <Info
                  k="Customer"
                  v={`${c.CustomerFName} ${c.CustomerLName}`}
                />
                <Info k="Dealer" v={c.DealerTitle} />
                <Info k="Phone" v={c.PhoneHome} />
                <Info k="Email" v={c.PrimaryEmail} />
                <Info
                  k="Vehicle"
                  v={[c.VehYear, c.Make, c.Model].filter(Boolean).join(" ")}
                />
                <Info k="VIN" v={c.VIN} />
              </div>
            )}

            {detail?.threads.map((t) => (
              <ThreadCard
                key={t.threadid}
                thread={t}
                onSent={() =>
                  setReload((r) => ({
                    id: message?.message_id ?? 0,
                    n: r.n + 1,
                  }))
                }
              />
            ))}
            {detail && detail.threads.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No conversations for this contract.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 shrink-0 text-muted-foreground">{k}</span>
      <span className="min-w-0 break-words font-medium">{v || "—"}</span>
    </div>
  );
}

function ThreadCard({
  thread,
  onSent,
}: {
  thread: ReferralThread;
  onSent: () => void;
}) {
  return (
    <section className="shrink-0 overflow-hidden rounded-lg border-2">
      <ul className="divide-y">
        {thread.messages.map((m) => (
          <MessageRow key={m.message_id} m={m} />
        ))}
      </ul>
      {thread.can_reply && (
        <ReplyBox threadId={thread.threadid} onSent={onSent} />
      )}
    </section>
  );
}

function MessageRow({ m }: { m: ReferralThreadMessage }) {
  return (
    <li className="flex gap-3 p-3">
      <div className="flex shrink-0 flex-col gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.sender_image}
          alt=""
          className="size-10 rounded-full object-cover"
        />
        {m.upload_img && (
          <a href={m.upload_img} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.upload_img}
              alt="Attachment"
              className="size-10 rounded object-cover"
            />
          </a>
        )}
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-sky-600">
          <span
            title={m.read_status === "red_circle" ? "Unread" : "Read"}
            className={cn(
              "size-2 rounded-full",
              m.read_status === "red_circle"
                ? "bg-red-500"
                : "bg-muted-foreground/50",
            )}
          />
          {m.sender_name}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs font-medium text-sky-600">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" />
            {m.message_date}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {m.message_time}
          </span>
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words">{m.message}</p>
        {m.sender_phone && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-sky-600">
            <Phone className="size-3" />
            {m.sender_phone}
          </p>
        )}
      </div>
    </li>
  );
}

function ReplyBox({
  threadId,
  onSent,
}: {
  threadId: number;
  onSent: () => void;
}) {
  const { unauthorized } = usePortal();
  const [text, setText] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const reply = text.trim();
    if (!reply || sending) return;
    const res = await fetching({
      url: "/api/ReferalChat/replyfromdetail",
      setLoading: setSending,
      body: {
        threadid: threadId,
        message_reply_id: threadId,
        message_reply: reply,
        isSendEmailNow: sendEmail ? 1 : 0,
        isSendSMS: 0,
      },
    });
    if (res.status === 401 || res.status === 403) {
      unauthorized(res.message);
      return;
    }
    if (!res.ok || res.success === false) {
      toast.error(res.message ?? "Could not send the reply.");
      return;
    }
    toast.success(res.message ?? "Reply sent.");
    setText("");
    onSent();
  };

  return (
    <div className="flex flex-col gap-2 border-t bg-muted/30 p-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Send message"
        rows={2}
        className="bg-background"
      />
      <div className="flex items-center justify-end gap-3">
        <label className="flex items-center gap-2 text-sm">
          Send Email
          <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
        </label>
        <Button size="sm" disabled={!text.trim() || sending} onClick={send}>
          {sending && <Loader2 className="animate-spin" />}
          Send
        </Button>
      </div>
    </div>
  );
}
