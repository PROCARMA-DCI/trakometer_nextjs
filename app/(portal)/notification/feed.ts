import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData } from "@/lib/trakometer/types";

export const notificationFeed: ChatFeed = {
  channel: "notification",
  url: "/api/react/Trakometer/notificationChatList",
  body: ({ range, limit, search, offset }) => ({
    limit,
    offset,
    fixed_parameter: range,
    dealer_title: search,
  }),
  // { success, message, data: { limit, offset, total_records, total_pages }, notifications: ChatListData[] }
  parse: (res) => ({
    // rows: (res.data?.notifications ?? []) as ChatListData[],
    rows:
      res.data.notifications.map((item: Record<string, unknown>) => ({
        ...item,
        icons: {
          device: item.device_type,
          is_unread: item?.totalunread == "0" ? false : true,
          gps_connected: item?.IsGpsContract == "1" ? true : false,
        },
      })) ?? ([] as ChatListData[]),
    pagination: {
      limit: res.limit,
      offset: res.offset,
      total: res.total_records,
    },
  }),
};
