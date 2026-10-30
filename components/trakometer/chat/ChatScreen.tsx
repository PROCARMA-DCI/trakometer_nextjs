"use client";

import { replyLoadThreadMessages } from "@/lib/trakometer/chat-api";
import type {
  ChannelId,
  ChatListData,
  ChatMessage,
  ThreadMode,
} from "@/lib/trakometer/types";
import { useCallback, useState } from "react";
import type { Pager } from "./chat-feed";
import ConversationList from "./conversation-list";
import QuickReplyModal from "./quick-reply-modal";

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

  const loadMessages = useCallback(async (item: ChatListData) => {
    const r = await replyLoadThreadMessages(item);
    setReplyLoadMessages(r.data.messages);
  }, []);

  const openRow = useCallback(
    (item: ChatListData, m: ThreadMode) => {
      setMode(m);
      setSelected(item);
      if (m === "reply") loadMessages(item);
    },
    [loadMessages],
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
      {/* <ThreadPanel
        thread={selThread}
        messages={messages}
        loading={messagesLoading}
        mode={mode}
        onMode={(m) => {
          setMode(m);
          setReplyMsg(null);
        }}
        onBack={() => setSelected(null)}
        starred={starred}
        flagged={flagged}
        replyMsg={replyMsg}
        onStar={toggleStar}
        onFlag={toggleFlag}
        onReply={setReplyMsg}
        onCancelReply={() => setReplyMsg(null)}
        onSend={(body, via) => replyMsg && reply(replyMsg, body, via)}
        onAppRating={() => selThread && appRating(selThread.contractNo)}
      /> */}

      {mode === "reply" && selected && replyLoadMessages && (
        <QuickReplyModal
          thread={selected}
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
