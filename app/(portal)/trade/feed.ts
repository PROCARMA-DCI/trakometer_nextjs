import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData } from "@/lib/trakometer/types";

export const tradeFeed: ChatFeed = {
  channel: "trade",
  url: "/api/react/Trakometer/vmtNotificationsList",
  body: ({ range, limit, offset }) => ({
    limit,
    offset,
    fixed_parameter: range,
    dealer_title: "",
  }),
  // { success, message, data: { limit, offset, total_records, total_pages }, notifications: ChatListData[] }
  parse: (res) => ({
    rows: (res.notifications ?? []) as ChatListData[],
    total: res.data?.total_records,
  }),
};
