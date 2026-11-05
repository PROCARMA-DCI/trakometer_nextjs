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

import {
  deleteParticularMessage,
  makeMessageFavorite,
  sendAppRating,
  sendThreadReply,
  updateParticularMessage,
} from "@/lib/trakometer/chat-api";
import type {
  ChatListData,
  ChatMessage,
  SpecificThreadChat,
} from "@/lib/trakometer/types";
import { showDateAndTimeFromUnix } from "@/lib/utility";
import { cn } from "@/lib/utils";
import {
  BellRing,
  Clock,
  Monitor,
  Pencil,
  Phone,
  Send,
  Smartphone,
  Star,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  thread: SpecificThreadChat;
  selected: ChatListData;
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

function Bubble({
  m,
  mine,
  onChanged,
  editing,
  anyEditing,
  setEditing,
}: {
  m: ChatMessage;
  mine: boolean;
  onChanged: () => void;
  /** This bubble is the one being edited. */
  editing: boolean;
  /** Some bubble is being edited, so hide edit/delete everywhere else. */
  anyEditing: boolean;
  setEditing: (editing: boolean) => void;
}) {
  const name = m.user1Name;
  const image = m.User1Image;

  const DeviceIcon = m.device_type === "mobile" ? Smartphone : Monitor;

  // Props are read-only, so keep the star in state; the backend may send "0"/"1".
  const [toggled, setFavourite] = useState<0 | 1>(m.favourite);

  const loadMessageFavorite = async () => {
    const res = await makeMessageFavorite(m.message_id, toggled);
    if (!res.ok) {
      return toast.error(res.error ?? "Could not update the favourite.");
    }
    setFavourite(res.data?.favourite ?? m.favourite);
  };
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(false);

  const saveEdit = async () => {
    setBusy(true);
    const res = await updateParticularMessage(m.message_id, editText.trim());
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Could not edit the message.");
    toast.success("Message updated.");
    setEditing(false);
    onChanged();
  };

  const removeMessage = async () => {
    if (!window.confirm("Delete this message?")) return;
    setBusy(true);
    const res = await deleteParticularMessage(m.message_id);
    setBusy(false);
    if (!res.ok) {
      return toast.error(res.error ?? "Could not delete the message.");
    }
    toast.success("Message deleted.");
    onChanged();
  };

  return (
    <div className={cn("flex items-end gap-2.5", mine && "flex-row-reverse")}>
      <Avatar className="size-8">
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex w-full flex-col gap-1 rounded-2xl border  px-3.5  py-2.5",
          mine
            ? "rounded-br-sm border-primary/20 bg-primary/10 ml-24"
            : "rounded-bl-sm bg-card mr-24",
        )}
      >
        <div className="w-full flex  items-center justify-between gap-x-2 text-xs ">
          <strong className="font-semibold">{name}</strong>
          {m.title && <span className="text-muted-foreground">{m.title}</span>}
          <div>
            <span className="text-xs">{m.User2Name}</span>
            <span className="whitespace-nowrap flex gap-1 items-center">
              <Clock className="size-3" />
              {showDateAndTimeFromUnix(m.timestamp)}
            </span>
            <span
              className="w-full flex justify-end cursor-pointer"
              onClick={loadMessageFavorite}
            >
              <Star size={20} fill={toggled ? "orange" : "none"} />
            </span>
          </div>
        </div>
        {m.message && !editing && (
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
        <div className="w-full justify-between flex ">
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            {" "}
            <strong>TEL</strong> <Phone className="size-3" />: {m.User1Phone}
          </div>
          {mine && !anyEditing && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  setEditText(m.message);
                  setEditing(true);
                }}
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={busy}
                onClick={removeMessage}
              >
                <Trash className="size-3" />
              </Button>
            </div>
          )}
        </div>
        {editing && (
          <div className="flex flex-col gap-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              autoFocus
              onFocus={(e) => {
                const end = e.currentTarget.value.length;
                e.currentTarget.setSelectionRange(end, end);
              }}
              className="bg-background"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="xs"
                disabled={!editText.trim() || busy}
                onClick={saveEdit}
              >
                Save
              </Button>
            </div>
          </div>
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
  selected,
  messages,
  onClose,
  onSent,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
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
      message_reply: draft.trim(),
      message_id: thread.messageid,
      isSendSMS: sms,
      isSendEmailNow: email,
      IsGuest: thread.is_guest,
    });
    setSending(false);
    if (!res.ok) return toast.error(res.error ?? "Could not send the reply.");
    toast.success("Reply sent.");
    setDraft("");
    onSent();
  };

  const rate = async () => {
    const res = await sendAppRating(thread.ContractID, thread.is_guest);
    if (res.ok) toast.success(res.message);
    else toast.error(res.error ?? "Could not send the app rating request.");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="size-4 text-primary" />
            <span className=" font-semibold">{thread?.DealerTitle}</span>{" "}
            Notification
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
              mine={m.sender_type === "admin"}
              onChanged={onSent}
              editing={editingId === m.message_id}
              anyEditing={editingId !== null}
              setEditing={(on) => setEditingId(on ? m.message_id : null)}
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
