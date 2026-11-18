"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteParticularMessage,
  makeMessageFavorite,
  setMessageFlag,
  updateParticularMessage,
} from "@/lib/trakometer/chat-api";
import type { ChatMessage, SpecificThreadChat } from "@/lib/trakometer/types";
import { cn } from "@/lib/utils";
import {
  Clock,
  Flag,
  Monitor,
  Pencil,
  Phone,
  Reply,
  Smartphone,
  Star,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ReplyBox from "./reply-box";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function ViewBubble({
  m,
  contractNo,
  mine,
  thread,
  replying,
  canReply,
  onReply,
  onCancelReply,
  onSent,
  isSendSmsShow,
  isSendEmailShow,
  isAppRatingShow,
  editing,
  anyEditing,
  setEditing,
  updateParticularMessageApi,
  deleteParticularMessageApi,
  favoriteChatmessageApi,
  setflagNotificationsApi,
  replyToThreadChatApi,
}: {
  m: ChatMessage;
  contractNo: string;
  mine: boolean;
  thread: SpecificThreadChat;
  replying: boolean;
  canReply: boolean;
  onReply: () => void;
  onCancelReply: () => void;
  onSent: () => void;
  isSendSmsShow?: boolean;
  isSendEmailShow?: boolean;
  isAppRatingShow?: boolean;
  /** This bubble is the one being edited. */
  editing: boolean;
  /** Some bubble is being edited, so hide edit/delete everywhere else. */
  anyEditing: boolean;
  setEditing: (editing: boolean) => void;
  updateParticularMessageApi?: string;
  deleteParticularMessageApi?: string;
  favoriteChatmessageApi?: string;
  setflagNotificationsApi?: string;
  replyToThreadChatApi?: string;
}) {
  const DeviceIcon = m.device_type === "mobile" ? Smartphone : Monitor;
  const name = m.user1Name;
  const [favToggled, setFavourite] = useState<0 | 1>(m.favourite);
  const [flagToggled, setFlag] = useState<0 | 1>(m.flag);
  const loadMessageFavorite = async () => {
    const res = await makeMessageFavorite(
      m.message_id,
      favToggled,
      favoriteChatmessageApi || undefined,
    );
    if (!res.ok) {
      return toast.error(res.error ?? "Could not update the favourite.");
    }
    setFavourite(res.data?.favourite ?? m.favourite);
  };
  const loadMessageFlag = async () => {
    const res = await setMessageFlag(
      m.message_id,
      flagToggled,
      setflagNotificationsApi,
    );
    if (!res.ok) {
      return toast.error(res.error ?? "Could not update the flag.");
    }
    setFlag(res.data?.flag ?? m.flag);
  };
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(false);

  const saveEdit = async () => {
    setBusy(true);
    const res = await updateParticularMessage(
      m.message_id,
      editText.trim(),
      updateParticularMessageApi || undefined,
    );
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Could not edit the message.");
    toast.success("Message updated.");
    setEditing(false);
    onSent();
  };

  const removeMessage = async () => {
    if (!window.confirm("Delete this message?")) return;
    setBusy(true);
    const res = await deleteParticularMessage(
      m.message_id,
      deleteParticularMessageApi || undefined,
    );
    setBusy(false);
    if (!res.ok) {
      return toast.error(res.error ?? "Could not delete the message.");
    }
    toast.success("Message deleted.");
    onSent();
  };
  return (
    <div className={cn("flex items-start gap-3", mine && "flex-row-reverse")}>
      <Avatar className="size-10">
        {m.User1Image && <AvatarImage src={m.User1Image} alt={name} />}
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5 rounded-md border-2 bg-card px-3.5 py-2.5",
          mine
            ? "border-primary/50 bg-primary/10"
            : "border-emerald-500/50 bg-card",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-sky-600">
              {name}
              {m.title && ` ${m.title}`}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {m.message_date} {m.message_time}
              <DeviceIcon className="ml-1 size-3" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            {m.User2Name && (
              <span className="text-xs font-semibold uppercase text-sky-700">
                {m.User2Name}
              </span>
            )}
            <span
              className="w-full flex justify-end cursor-pointer"
              onClick={loadMessageFlag}
            >
              <Flag size={20} fill={flagToggled ? "red" : "none"} />
            </span>
            <span
              className="w-full flex justify-end cursor-pointer"
              onClick={loadMessageFavorite}
            >
              <Star size={20} fill={favToggled ? "orange" : "none"} />
            </span>
          </div>
        </div>
        {m.message && !editing && (
          <div
            className="break-words text-sm [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: m.message }}
          />
        )}
        {m.attachment_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.attachment_url}
            alt="Attachment"
            className="max-h-24 w-fit rounded-lg border"
          />
        )}
        <div className="w-full justify-between flex ">
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            {" "}
            <strong>TEL</strong> <Phone className="size-3" />: {m.User1Phone}
          </div>
          <div className="flex items-center gap-1">
            {mine && !anyEditing && (
              <>
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
              </>
            )}
            {m.can_show_reply_button && (
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
          </div>
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
        {replying && (
          <ReplyBox
            thread={thread}
            message={m}
            onCancel={onCancelReply}
            onSent={onSent}
            replyToThreadChatApi={replyToThreadChatApi}
            isSendSmsShow={isSendSmsShow}
            isSendEmailShow={isSendEmailShow}
            isAppRatingShow={isAppRatingShow}
          />
        )}
      </div>
    </div>
  );
}
