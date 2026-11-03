"use client";

import {
  notificationViewApi,
  replyLoadThreadMessages,
} from "@/lib/trakometer/chat-api";
import type {
  ChannelId,
  ChatListData,
  ChatMessage,
  SpecificThreadChat,
  ThreadMode,
} from "@/lib/trakometer/types";
import { useCallback, useState } from "react";
import type { Pager } from "./chat-feed";
import ConversationList from "./conversation-list";
import QuickReplyModal from "./quick-reply-modal";
import ViewThreadPanel from "./view-thread-panel";

interface Props {
  rows: ChatListData[];
  channel: ChannelId;
  loading?: boolean;
  error?: string | null;
  pager?: Pager;
}

const ChatScreen = ({
  rows,
  channel,
  loading = false,
  error = null,
  pager,
}: Props) => {
  const [newestFirst, setNewestFirst] = useState(true);
  const [selected, setSelected] = useState<ChatListData | null>(null);
  const [mode, setMode] = useState<ThreadMode>("reply");
  const [replyLoadMessages, setReplyLoadMessages] = useState<
    ChatMessage[] | null
  >(null);
  const [viewMessages, setViewMessages] = useState<ChatMessage[] | null>(null);
  const [specificThread, setSpecificThread] =
    useState<SpecificThreadChat | null>(null);

  const loadMessages = useCallback(async (item: ChatListData) => {
    const r = await replyLoadThreadMessages(item);
    setSpecificThread(r.data);
    setReplyLoadMessages(r.data.messages);
  }, []);

  const loadViewMessages = useCallback(async (item: ChatListData) => {
    const r = await notificationViewApi(item);
    setSpecificThread(r.data);
    setViewMessages(r.data.messages);
  }, []);

  const openRow = useCallback(
    (item: ChatListData, m: ThreadMode) => {
      setMode(m);
      setSelected(item);
      if (m === "reply") loadMessages(item);
      else if (m === "full") loadViewMessages(item);
    },
    [loadMessages, loadViewMessages],
  );
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <ConversationList
        rows={rows}
        selected={selected}
        channel={channel}
        newestFirst={newestFirst}
        loading={loading}
        error={error}
        pager={pager}
        onToggleSort={() => setNewestFirst(!newestFirst)}
        onOpen={openRow}
      />
      {mode === "full" && specificThread && selected && viewMessages && (
        <ViewThreadPanel
          thread={specificThread}
          selected={selected}
          messages={viewMessages}
          onBack={() => {
            setSelected(null);
            setViewMessages(null);
          }}
          onSent={() => loadViewMessages(selected)}
        />
      )}

      {mode === "reply" && specificThread && selected && replyLoadMessages && (
        <QuickReplyModal
          thread={specificThread}
          selected={selected}
          messages={replyLoadMessages}
          onClose={() => {
            setSelected(null);
            setReplyLoadMessages(null);
          }}
          onSent={() => loadMessages(selected)}
        />
      )}
    </div>
  );
};

export default ChatScreen;
