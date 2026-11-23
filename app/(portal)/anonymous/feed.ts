import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData } from "@/lib/trakometer/types";

export const anonymousFeed: ChatFeed = {
  channel: "anonymous",
  url: "/api/react/Trakometer/anonymousNotificationsList",
  body: ({ range, limit, search, offset }) => ({
    limit,
    offset,
    fixed_parameter: range,
    dealer_title: search,
  }),
  // { success, message, data: { limit, offset, total_records, total_pages }, notifications: ChatListData[] }
  parse: (res) => ({
    rows: (
      (res.data?.notifications ?? []) as (ChatListData & {
        is_gps_contract?: string | number;
      })[]
    ).map((item) => ({
      ...item,
      icons: {
        ...item.icons,
        gps_connected: String(item.is_gps_contract) === "1",
      },
    })),
    pagination: {
      limit: res.data.limit,
      offset: res.data.offset,
      total: res.data.total_records,
    },
  }),
};
