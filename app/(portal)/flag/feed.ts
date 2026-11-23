import type { ChatFeed } from "@/components/trakometer/chat/chat-feed";
import type { ChatListData } from "@/lib/trakometer/types";

/** "12/29/2021" + "07:28 pm" → "2021-12-29 19:28:00" (what showDateAndTimeRaw expects). */
function toSqlDateTime(date?: string, time?: string) {
  const d = date?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!d) return "";
  const t = time?.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  let h = t ? Number(t[1]) % 12 : 0;
  if (t?.[3]?.toLowerCase() === "pm") h += 12;
  const pad = (n: string | number) => String(n).padStart(2, "0");
  return `${d[3]}-${pad(d[1])}-${pad(d[2])} ${pad(h)}:${t?.[2] ?? "00"}:00`;
}

export const flagFeed: ChatFeed = {
  channel: "flag",
  url: "/api/react/Trakometer/flagNotificationsData",
  body: ({ range, search, limit, offset }) => ({
    limit,
    offset,
    FixedDateParaMeter: range,
    DealerTitle: search,
  }),

  parse: (res) => ({
    rows:
      res.data.chat_notifications.map((item: Record<string, unknown>) => ({
        ...item,
        user1Name: item.sender_name,
        User2Name: item.receiver_name,
        notification_date: toSqlDateTime(
          item.notification_date as string,
          item.notification_time as string,
        ),
      })) ?? ([] as ChatListData[]),
    pagination: {
      ...res.data.pagination,
      total: res.data.pagination.total_records,
    },
  }),
};
