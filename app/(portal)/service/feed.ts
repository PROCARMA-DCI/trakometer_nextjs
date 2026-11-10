import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { Pagination, ServicePlanList } from "@/lib/trakometer/types";

export const chatFeed: ChatFeed<ServicePlanList> = {
  channel: "service",
  url: "/api/react/Trakometer/scheduleNotificationsData",
  body: ({ range, limit, search, offset }) => ({
    limit,
    offset,
    FixedDateParaMeter: range,
    dealer_title: search,
  }),
  // { success, message, data: { limit, offset, total_records, total_pages }, notifications: ChatListData[] }
  parse: (res) => ({
    rows: (res.data?.plans ?? []) as ServicePlanList[],
    pagination: {
      ...res.data.pagination,
      total: res.data.pagination.total_records,
    } as Pagination,
  }),
};
