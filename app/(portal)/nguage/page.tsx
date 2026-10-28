"use client";
import ChatScreen from "@/components/trakometer/chat/ChatScreen";
import { useChatFeed } from "@/components/trakometer/chat/chat-feed";
import { nguageFeed } from "./feed";

export default function Page() {
  const { rows, loading, error, pager } = useChatFeed();
  return (
    <ChatScreen
      rows={rows}
      channel={nguageFeed.channel}
      loading={loading}
      error={error}
      pager={pager}
    />
  );
}
