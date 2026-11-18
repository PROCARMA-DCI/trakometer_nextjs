"use client";
import ChatScreen from "@/components/trakometer/chat/ChatScreen";
import { useChatFeed } from "@/components/trakometer/chat/chat-feed";
import { anonymousFeed } from "./feed";

export default function Page() {
  const { rows, loading, error, pager } = useChatFeed();

  return (
    <ChatScreen
      rows={rows}
      channel={anonymousFeed.channel}
      loading={loading}
      error={error}
      pager={pager}
      chatThreadApi={"anonymousChatThread"}
      viewContractChatWindowApi={"viewContractChatWindowAnonymous"}
      replyToThreadChatApi={"anonymousChatReply"}
      updateParticularMessageApi={"updateParticularAnonymousMessage"}
      deleteParticularMessageApi={"deleteParticularAnonymousMessage"}
      isSendSmsShow={false}
      isSendEmailShow={false}
      isAppRatingShow={false}
    />
  );
}
