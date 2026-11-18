"use client";

import type {
  ChatListData,
  ChatMessage,
  SpecificThreadChat,
} from "@/lib/trakometer/types";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import ViewBubble from "./view-bubble";

interface Props {
  thread: SpecificThreadChat;
  selected: ChatListData;
  messages: ChatMessage[];
  onBack: () => void;
  /** Called after a reply is sent so the caller can reload the messages. */
  onSent: () => void;
  isSendSmsShow?: boolean;
  isSendEmailShow?: boolean;
  isAppRatingShow?: boolean;
  updateParticularMessageApi?: string;
  deleteParticularMessageApi?: string;
  favoriteChatmessageApi?: string;
  setflagNotificationsApi?: string;
  replyToThreadChatApi?: string;
}

export default function ViewThreadPanel({
  thread,
  selected,
  messages,
  onBack,
  onSent,
  isSendSmsShow = true,
  isSendEmailShow = true,
  isAppRatingShow = true,
  updateParticularMessageApi = "",
  deleteParticularMessageApi = "",
  favoriteChatmessageApi = "",
  replyToThreadChatApi = "",
  setflagNotificationsApi = "",
}: Props) {
  const [replyId, setReplyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

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
            mine={m.sender_type === "admin"}
            thread={thread}
            isSendSmsShow={isSendSmsShow}
            isSendEmailShow={isSendEmailShow}
            isAppRatingShow={isAppRatingShow}
            editing={editingId === m.message_id}
            anyEditing={editingId !== null}
            setEditing={(on) => setEditingId(on ? m.message_id : null)}
            replyToThreadChatApi={replyToThreadChatApi}
            updateParticularMessageApi={updateParticularMessageApi}
            deleteParticularMessageApi={deleteParticularMessageApi}
            favoriteChatmessageApi={favoriteChatmessageApi}
            setflagNotificationsApi={setflagNotificationsApi}
            replying={replyId === m.message_id}
            // Only one reply form at a time: hide every Reply until it is closed.
            canReply={replyId === null}
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
