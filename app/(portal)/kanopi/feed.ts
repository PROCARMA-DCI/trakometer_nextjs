import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { KanopiThread, Pagination } from "@/lib/trakometer/types";

export const kanopiFeed: ChatFeed<KanopiThread> = {
  channel: "kanopi",
  url: "/api/react/Trakometer/kanopiAdminChatsList",
  body: ({ search, limit, offset, range }) => ({
    dealer_title: search,
    limit,
    offset,
    sort: "",
    FixedParameter: range,
  }),
  // { success, message, data: { pagination: { limit, offset, total_records, has_more }, kanopi_threads: [] } }
  parse: (res) => ({
    rows: (res.data?.kanopi_threads ?? []) as KanopiThread[],
    pagination: {
      ...res.data?.pagination,
      total: res.data?.pagination?.total_records,
    } as Pagination,
  }),
};
