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
  replyToThreadChatApi,
  isSendSmsShow = true,
  isSendEmailShow = true,
  isAppRatingShow = true,
}: {
  thread: SpecificThreadChat;
  message: ChatMessage;
  onCancel: () => void;
  onSent: () => void;
  replyToThreadChatApi?: string;
  isSendSmsShow?: boolean;
  isSendEmailShow?: boolean;
  isAppRatingShow?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    const item = {
      message_reply: draft.trim(),
      message_id: message.message_id,
      // Hidden options are left out of the request entirely.
      isSendSMS: isSendSmsShow ? sms : undefined,
      isSendEmailNow: isSendEmailShow ? email : undefined,
      IsGuest: thread.is_guest,
    };
    const res = await sendThreadReply(item, replyToThreadChatApi);
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
        {(isSendSmsShow || isSendEmailShow) && (
          <span className="text-muted-foreground">Send</span>
        )}
        {isSendSmsShow && (
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={sms}
              onChange={(e) => setSms(e.target.checked)}
            />
            SMS
          </label>
        )}
        {isSendEmailShow && (
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={email}
              onChange={(e) => setEmail(e.target.checked)}
            />
            Email
          </label>
        )}
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
        onRate={isAppRatingShow ? rate : undefined}
        draft={draft}
        onInsert={(text) => setDraft((d) => appendToDraft(d, text))}
      />
    </div>
  );
}
