// Shared chat helpers: every channel (N-Gauge, Value My Trade, …) gets a
// `ChatListData[]` from its own API and runs it through these, so the screen
// never cares which backend call produced the rows.

import type { ChatListData, ChatMessage, Contact, Party } from "./types";
import { fmtTime } from "./utils";

const AVATAR_COLORS = [
  { bg: "#DDF4EE", fg: "#0B6E5E" },
  { bg: "#E8E6FB", fg: "#4B3FB0" },
  { bg: "#FDE8D7", fg: "#B4530B" },
  { bg: "#DCEBFB", fg: "#1D5FA8" },
  { bg: "#FBE0E8", fg: "#A8244F" },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-09-25 13:05:00" → { date: "Sep 25 2026", time: "01:05 PM" } (raw text if unparsable). */
export function formatStamp(ts: string | null | undefined): {
  date: string;
  time: string;
} {
  const d = new Date(String(ts ?? "").replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return { date: String(ts ?? ""), time: "" };
  return {
    date: `${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`,
    time: fmtTime(d),
  };
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

function colorFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function contactFromRow(r: ChatListData): Contact {
  const name = r.user1Name?.trim() || "Unknown";
  return {
    key: r.ContractNo || name,
    name,
    id: r.ContractNo ?? "",
    dealer: r.user2Name ?? "",
    phone: "",
    email: "",
    initials: initialsOf(name),
    ...colorFor(name),
  };
}

/** The list rows are customer messages; unread = the dealer side hasn't read it. */
export function toThread(r: ChatListData): ChatListData {
  const { date, time } = formatStamp(r.timestamp);
  return {
    key: `${r.threadid}:${r.message_id}`,
    threadId: r.threadid,
    messageId: r.message_id,
    contractNo: r.ContractNo,
    contact: contactFromRow(r),
    message: r.message,
    device: /ios|android|mobile|app/i.test(r.device_type ?? "")
      ? "mobile"
      : "desktop",
    date,
    time,
    unread: !["1", "true"].includes(String(r.user2read).toLowerCase()),
  };
}

/** Case-insensitive match on name / dealer / contract number. */
export function matchesSearch(t: ChatListData, term: string): boolean {
  const s = term.trim().toLowerCase();
  if (!s) return true;
  const c = t.contact;
  return (c.name + " " + c.dealer + " " + c.id).toLowerCase().includes(s);
}

/** Newest/oldest ordering by the backend timestamp; rows are never mutated. */
export function sortRows(rows: ChatListData[], newestFirst: boolean) {
  const t = (r: ChatListData) =>
    new Date(r.timestamp.replace(" ", "T")).getTime() || 0;
  return rows.slice().sort((a, b) => (newestFirst ? t(b) - t(a) : t(a) - t(b)));
}

/**
 * `specificThreadChats` rows → messages (oldest first).
 * The sender is read from `sender`/`user_type`; anything naming the dealer
 * side counts as the agent, everything else as the customer.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseThreadMessages(res: Record<string, any>): ChatMessage[] {
  const raw: unknown = res.data ?? res.messages ?? res.notifications ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r, i): ChatMessage => {
      const who = String(r.sender ?? r.user_type ?? "").toLowerCase();
      const from: Party = /agent|admin|dealer|user2/.test(who)
        ? "agent"
        : "cust";
      const { date, time } = formatStamp(r.timestamp);
      return {
        id: String(r.message_id ?? i),
        from,
        date,
        time,
        body: String(r.message ?? ""),
      };
    })
    .sort((a, b) => Number(a.id) - Number(b.id) || 0);
}
