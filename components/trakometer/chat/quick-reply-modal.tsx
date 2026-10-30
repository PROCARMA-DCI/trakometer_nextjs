"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { sendAppRating, sendThreadReply } from "@/lib/trakometer/chat-api";
import type { ChatListData, ChatMessage } from "@/lib/trakometer/types";
import { showDateAndTimeFromUnix } from "@/lib/utility";
import { cn } from "@/lib/utils";
import { BellRing, Clock, Monitor, Send, Smartphone, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  thread: ChatListData;
  messages: ChatMessage[];
  onClose: () => void;
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

function Bubble({ m, mine }: { m: ChatMessage; mine: boolean }) {
  const name = m.user1Name;
  const image = m.User1Image;

  const DeviceIcon = m.device_type === "mobile" ? Smartphone : Monitor;

  return (
    <div className={cn("flex items-end gap-2.5", mine && "flex-row-reverse")}>
      <Avatar className="size-8">
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex max-w-[90%] flex-col gap-1 rounded-2xl border px-3.5 py-2.5",
          mine
            ? "rounded-br-sm border-primary/20 bg-primary/10"
            : "rounded-bl-sm bg-card",
        )}
      >
        <div className="flex  items-center justify-between gap-x-2 text-xs ">
          <strong className="font-semibold">{name}</strong>
          {m.title && <span className="text-muted-foreground">{m.title}</span>}
          <div>
            <span className="text-xs">{m.User2Name}</span>
            <span className="flex gap-1 items-center">
              <Clock className="size-3" />
              {showDateAndTimeFromUnix(m.timestamp)}
            </span>
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
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <DeviceIcon className="size-3" />
        </div>
      </div>
    </div>
  );
}

export default function QuickReplyModal({
  thread,
  messages,
  onClose,
  onSent,
}: Props) {
  const [draft, setDraft] = useState("");
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Show the latest message whenever the conversation changes.
  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  const send = async () => {
    setSending(true);
    const res = await sendThreadReply({
      message: draft.trim(),
      replyToId: thread.threadid,
      sms,
      email,
    });
    setSending(false);
    if (!res.ok) return toast.error(res.error ?? "Could not send the reply.");
    toast.success("Reply sent.");
    setDraft("");
    onSent();
  };

  const rate = async () => {
    const res = await sendAppRating(thread.ContractNo);
    if (res.ok) toast.success("App rating request sent.");
    else toast.error(res.error ?? "Could not send the app rating request.");
  };
  console.log({ thread, messages });
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="size-4 text-primary" />
            {thread.user1Name}
            <span className="text-xs font-normal text-muted-foreground">
              {thread.ContractNo}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-muted/30 px-5 py-4">
          {messages.map((m) => (
            <Bubble
              key={m.message_id}
              m={m}
              mine={m.user1Name !== thread.user1Name}
            />
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex flex-col gap-3 border-t px-5 py-4">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message here…"
            rows={3}
            autoFocus
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={sms}
                onChange={(e) => setSms(e.target.checked)}
              />
              Send SMS
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
              />
              Send email
            </label>
            <div className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={rate}>
              <Star className="size-3.5 text-amber-500" />
              App rating
            </Button>
            <Button
              size="sm"
              disabled={!draft.trim() || sending}
              onClick={send}
            >
              <Send className="size-3.5" />
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
