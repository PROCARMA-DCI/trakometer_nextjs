import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData, Pagination } from "@/lib/trakometer/types";

export const chatFeed: ChatFeed = {
  channel: "service",
  url: "/api/react/Trakometer/scheduleNotificationsData",
  body: ({ range, limit, search, offset }) => ({
    limit,
    offset,
    fixed_parameter: range,
    dealer_title: search,
  }),
  // { success, message, data: { limit, offset, total_records, total_pages }, notifications: ChatListData[] }
  parse: (res) => ({
    rows: (res.data?.plans ?? []) as ChatListData[],
    pagination: {
      ...res.pagination,
      total: res.pagination.total_records,
    } as Pagination,
  }),
};
