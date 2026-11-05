import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData } from "@/lib/trakometer/types";

export const nguageFeed: ChatFeed = {
  channel: "ngauge",
  url: "/api/react/Trakometer/nguageChatNotificationsData",
  body: ({ range, search, limit, offset }) => ({
    limit,
    offset,
    sortColumn: "",
    sortOrder: "",
    FixedDateParameter: range,
    dealer_title: search,
    SearchCustomer: "",
  }),

  parse: (res) => ({
    rows: (res.data ?? []) as ChatListData[],
    pagination: { ...res.pagination, total: res.pagination.total_records },
  }),
};
