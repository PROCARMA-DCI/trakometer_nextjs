import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData } from "@/lib/trakometer/types";

export const tradeFeed: ChatFeed = {
  channel: "trade",
  url: "/api/react/Trakometer/vmtNotificationsList",
  body: ({ range, limit, search, offset }) => ({
    limit,
    offset,
    fixed_parameter: range,
    dealer_title: search,
  }),
  // { success, message, data: { limit, offset, total_records, total_pages }, notifications: ChatListData[] }
  parse: (res) => ({
    rows: (res.data?.notifications ?? []) as ChatListData[],
    pagination: {
      limit: res.limit,
      offset: res.offset,
      total: res.total_records,
    },
  }),
};
