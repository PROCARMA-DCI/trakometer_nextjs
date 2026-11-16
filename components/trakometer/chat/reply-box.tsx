"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendAppRating, sendThreadReply } from "@/lib/trakometer/chat-api";
import type { ChatMessage, SpecificThreadChat } from "@/lib/trakometer/types";
import { Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ReplyTemplates, { appendToDraft } from "./reply-templates";

/** Inline reply form that opens under the message being answered. */
export default function ReplyBox({
  thread,
  message,
  onCancel,
  onSent,
}: {
  thread: SpecificThreadChat;
  message: ChatMessage;
  onCancel: () => void;
  onSent: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    const res = await sendThreadReply({
      message_reply: draft.trim(),
      message_id: message.message_id,
      isSendSMS: sms,
      isSendEmailNow: email,
      IsGuest: thread.is_guest,
    });
    setSending(false);
    if (!res.ok) return toast.error(res.error ?? "Could not send the reply.");
    toast.success("Reply sent.");
    onSent();
  };

  const rate = async () => {
    const res = await sendAppRating(thread.ContractID, thread.is_guest);
    if (res.ok) toast.success(res.message);
    else toast.error(res.error ?? "Could not send the app rating request.");
  };

  return (
    <div className="mt-2 flex flex-col gap-3 border-t pt-3">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type a message here…"
        rows={4}
        autoFocus
        className="bg-background"
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-muted-foreground">Send</span>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={sms}
            onChange={(e) => setSms(e.target.checked)}
          />
          SMS
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={email}
            onChange={(e) => setEmail(e.target.checked)}
          />
          Email
        </label>
        <div className="flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="size-3.5" />
          Cancel
        </Button>
        <Button size="sm" disabled={!draft.trim() || sending} onClick={send}>
          <Send className="size-3.5" />
          Reply
        </Button>
      </div>
      <ReplyTemplates
        sources={[thread, message]}
        onRate={rate}
        onInsert={(text) => setDraft((d) => appendToDraft(d, text))}
      />
    </div>
  );
}
