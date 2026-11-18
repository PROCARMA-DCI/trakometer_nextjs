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
import { useCallback, useEffect, useState } from "react";
import type { Pager } from "./chat-feed";
import { useChatUi } from "./ChatLayout";
import ConversationList from "./conversation-list";
import QuickReplyModal from "./quick-reply-modal";
import ViewThreadPanel from "./view-thread-panel";

interface Props {
  rows: ChatListData[];
  channel: ChannelId;
  loading?: boolean;
  error?: string | null;
  pager?: Pager;
  chatThreadApi?: string;
  viewContractChatWindowApi?: string;
  isSendSmsShow?: boolean;
  isSendEmailShow?: boolean;
  isAppRatingShow?: boolean;
}

const ChatScreen = ({
  rows,
  channel,
  loading = false,
  error = null,
  pager,
  chatThreadApi = "",
  viewContractChatWindowApi = "",
  isSendSmsShow = true,
  isSendEmailShow = true,
  isAppRatingShow = true,
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

  // On mobile the full conversation replaces the list, so the channel bar steps aside too.
  const { setThreadOpen } = useChatUi();
  const fullOpen = mode === "full" && !!selected;
  useEffect(() => {
    setThreadOpen(fullOpen);
    return () => setThreadOpen(false);
  }, [fullOpen, setThreadOpen]);

  const loadMessages = useCallback(async (item: ChatListData) => {
    const r = await replyLoadThreadMessages(item, chatThreadApi);
    const data = {
      ...r.data,
      canned_messages: r.data?.cannedmeesag,
      google_feedback: r.data?.googlefeedback,
    };
    setSpecificThread(data as SpecificThreadChat);
    setReplyLoadMessages(r.data.messages);
  }, []);

  const loadViewMessages = useCallback(async (item: ChatListData) => {
    const r = await notificationViewApi(item, viewContractChatWindowApi);
    setSpecificThread(r?.data);
    setViewMessages(r?.data?.messages);
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
        // The quick-reply dialog floats over the list; only the full thread replaces it on mobile.
        selected={mode === "full" ? selected : null}
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
          isSendSmsShow={isSendSmsShow}
          isSendEmailShow={isSendEmailShow}
          isAppRatingShow={isAppRatingShow}
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
          isSendSmsShow={isSendSmsShow}
          isSendEmailShow={isSendEmailShow}
          isAppRatingShow={isAppRatingShow}
        />
      )}
    </div>
  );
};

export default ChatScreen;
