import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData } from "@/lib/trakometer/types";

export const favouriteFeed: ChatFeed = {
  channel: "favourite",
  url: "/api/react/Trakometer/favoriteChatsList",
  body: ({ range, search, limit, offset }) => ({
    limit,
    offset,
    fixed_parameter: range,
    dealer_title: search,
  }),

  parse: (res) => ({
    // rows: (res.data?.notifications ?? []) as ChatListData[],
    rows:
      res.data?.notifications.map((item: Record<string, unknown>) => ({
        ...item,
        icons: {
          device: item.device_type,
          is_unread: item?.totalunread == "0" ? false : true,
          IsGpsContract: item?.IsGpsContract == "1" ? true : false,
        },
      })) ?? ([] as ChatListData[]),
    pagination: {
      limit: res.data?.limit,
      offset: res.data?.offset,
      total: res.data?.total_records,
    },
  }),
};
