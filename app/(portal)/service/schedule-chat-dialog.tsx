"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { replyScheduleChat } from "@/lib/trakometer/chat-api";
import type {
  ScheduleChatMessage,
  ScheduleChatWindow,
} from "@/lib/trakometer/types";
import { CalendarDays, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type ChatMode = "view" | "all";

const plain = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();

const FALLBACK_AVATAR = "https://mypcp.us/pcp_files/img/user.png";

/** Falls back to the default user image when there is no file (e.g. a bare folder URL) or it fails to load. */
function Avatar({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  // A URL ending in "/" has no file name, so skip the request.
  const valid = !!src && !src.endsWith("/") && !failed;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={valid ? src : FALLBACK_AVATAR}
      alt={name}
      onError={() => setFailed(true)}
      className="w-20 h-20 shrink-0 rounded-full bg-muted object-contain"
    />
  );
}

function Bubble({ m }: { m: ScheduleChatMessage }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar src={m.User1Image} name={m.user1Name} />
      <div className="min-w-0 flex-1 border-2 border-border/70 p-2">
        {m.user1Name && (
          <div className="text-sm text-sky-500">{m.user1Name}</div>
        )}
        {m.title && <div className="text-xs font-medium">{m.title}</div>}
        <p className="whitespace-pre-wrap break-words text-sm">
          {plain(m.message)}
        </p>
        {m?.attachment_url && (
          <img
            src={m.attachment_url}
            height={100}
            width={100}
            className="cursor-pointer"
          />
        )}
        <div className="mt-1 flex flex-wrap items-end justify-between gap-2 text-xs text-sky-500">
          <span>{m.User1Phone ? `Tel : ${m.User1Phone}` : "Tel :"}</span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5 text-foreground" />
              {m.message_date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-foreground" />
              {m.message_time}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScheduleChatDialog({
  open,
  onOpenChange,
  mode,
  title,
  chat,
  onLoad,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ChatMode;
  title: string;
  chat: ScheduleChatWindow | null;
  /** Called after a reply is sent so the caller can reload the thread. */
  onLoad: () => void;
}) {
  const [text, setText] = useState("");
  const [isResolved, setIsResolved] = useState(chat?.is_resolved ? 1 : 0);
  const [sending, setSending] = useState(false);

  // The dialog stays mounted, so re-sync from the API data every time a fresh
  // chat loads (or the dialog opens) instead of keeping the previous local toggle.
  const [synced, setSynced] = useState({ open, chat });
  if (synced.open !== open || synced.chat !== chat) {
    setSynced({ open, chat });
    if (open) setIsResolved(chat?.is_resolved ? 1 : 0);
  }
  const messages = chat?.messages ?? [];
  const bottomRef = useRef<HTMLDivElement>(null);

  // Show the newest message (e.g. the reply just sent) whenever the thread loads or grows.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ block: "end" }),
    );
    return () => cancelAnimationFrame(id);
  }, [open, messages.length]);

  const canReply = mode === "view" && chat?.can_reply !== false;

  const send = async () => {
    if (!chat) return;
    const message = text.trim();
    if (!message || messages.length === 0) return;
    setSending(true);
    // Unverified: which ids the backend expects; replying to the latest message.
    const res = await replyScheduleChat({
      message,
      threadid: chat.threadid,
      isResolved,
    });
    setSending(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not send the reply.");
      return;
    }
    setText("");
    onLoad();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sky-500">{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <Bubble key={m.message_id} m={m} />
          ))}
          <div ref={bottomRef} />
          {chat && messages.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">
              No messages.
            </p>
          )}
        </div>
        <div className=" border-t pt-3 ">
          <div className="flex gap-2 items-center bg-muted p-2">
            <Checkbox
              checked={isResolved === 1}
              onCheckedChange={(checked) => setIsResolved(checked ? 1 : 0)}
            />
            <Label>Resolved</Label>
          </div>
        </div>
        {canReply && (
          <div className="space-y-2 ">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Send message"
              rows={3}
            />
            {chat && (
              <div className="flex justify-center">
                <Button onClick={send} disabled={sending || !text.trim()}>
                  Send and Update
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
