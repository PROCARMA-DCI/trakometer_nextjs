"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendAppRating, sendThreadReply } from "@/lib/trakometer/chat-api";
import type {
  ChatListData,
  ChatMessage,
  SpecificThreadChat,
} from "@/lib/trakometer/types";
import { showDateAndTimeFromUnix } from "@/lib/utility";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Monitor,
  Reply,
  Send,
  Smartphone,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  thread: SpecificThreadChat;
  selected: ChatListData;
  messages: ChatMessage[];
  onBack: () => void;
  /** Called after a reply is sent so the caller can reload the messages. */
  onSent: () => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Inline reply form that opens under the message being answered. */
function ReplyBox({
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
        <Button type="button" variant="outline" size="sm" onClick={rate}>
          <Star className="size-3.5 text-amber-500" />
          App Rating
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="size-3.5" />
          Cancel
        </Button>
        <Button size="sm" disabled={!draft.trim() || sending} onClick={send}>
          <Send className="size-3.5" />
          Reply
        </Button>
      </div>
    </div>
  );
}

function ViewBubble({
  m,
  contractNo,
  mine,
  starred,
  replying,
  thread,
  onStar,
  onReply,
  onCancelReply,
  onSent,
}: {
  m: ChatMessage;
  contractNo: string;
  mine: boolean;
  starred: boolean;
  replying: boolean;
  thread: SpecificThreadChat;
  onStar: () => void;
  onReply: () => void;
  onCancelReply: () => void;
  onSent: () => void;
}) {
  const DeviceIcon = m.device_type === "mobile" ? Smartphone : Monitor;
  const name = m.user1Name;

  return (
    <div className={cn("flex items-start gap-3", mine && "flex-row-reverse")}>
      <Avatar className="size-10">
        {m.User1Image && <AvatarImage src={m.User1Image} alt={name} />}
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5 rounded-md border-2 bg-card px-3.5 py-2.5",
          mine ? "border-red-400" : "border-emerald-500",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-sky-600">
              {name}
              {!mine && ` (${contractNo})`}
              {m.title && ` ${m.title}`}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {showDateAndTimeFromUnix(m.timestamp)}
              <DeviceIcon className="ml-1 size-3" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            {m.User2Name && (
              <span className="text-xs font-semibold uppercase text-sky-700">
                {m.User2Name}
              </span>
            )}
            {!mine && !replying && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={onReply}
              >
                <Reply className="size-3" />
                Reply
              </Button>
            )}
            <button
              type="button"
              title={starred ? "Remove star" : "Star"}
              onClick={onStar}
            >
              <Star
                className={cn(
                  "size-5",
                  starred && "fill-amber-400 text-amber-400",
                )}
              />
            </button>
          </div>
        </div>
        {m.message && (
          <div
            className="break-words text-sm [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: m.message }}
          />
        )}
        {m.upload_img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.upload_img}
            alt="Attachment"
            className="max-h-48 w-fit rounded-lg border"
          />
        )}
        {replying && (
          <ReplyBox
            thread={thread}
            message={m}
            onCancel={onCancelReply}
            onSent={onSent}
          />
        )}
      </div>
    </div>
  );
}

export default function ViewThreadPanel({
  thread,
  selected,
  messages,
  onBack,
  onSent,
}: Props) {
  const [replyId, setReplyId] = useState<string | null>(null);
  // Star marks are client-only (no API).
  const [starred, setStarred] = useState<Record<string, boolean>>({});

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b px-3 py-2.5 text-sm sm:px-4">
        <button
          onClick={onBack}
          title="Back to conversations"
          className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-muted md:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span>
          Contract Number :{" "}
          <span className="font-mono text-sky-600">{thread.ContractNo}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          · {messages.length} messages
        </span>
      </div>
      <div className="scroll-whatsapp flex-1 space-y-4 overflow-y-auto bg-muted/20 p-3 sm:p-4">
        {!messages.length && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No messages found.
          </div>
        )}
        {messages.map((m) => (
          <ViewBubble
            key={m.message_id}
            m={m}
            contractNo={thread.ContractNo}
            // Same rule as QuickReplyModal: anyone other than the sender of the
            // selected row is "mine"; the rest are the ones we can reply to.
            mine={m.user1Name !== selected.user1Name}
            starred={!!starred[m.message_id]}
            replying={replyId === m.message_id}
            thread={thread}
            onStar={() =>
              setStarred((s) => ({ ...s, [m.message_id]: !s[m.message_id] }))
            }
            onReply={() => setReplyId(m.message_id)}
            onCancelReply={() => setReplyId(null)}
            onSent={() => {
              setReplyId(null);
              onSent();
            }}
          />
        ))}
      </div>
    </section>
  );
}
