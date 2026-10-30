// Chat calls that every channel shares (open a thread, reply, send app rating).
// Channel-specific list calls live next to their page (app/(portal)/<channel>/feed.ts).

import { fetching } from "@/lib/api/client";
import { parseThreadMessages } from "./chat";
import type { ChatListData, ChatMessage } from "./types";

const BASE = "/api/react/Trakometer";
const APP_RATING_URL = `${BASE}/appRatingSend`;

/** "This thread" sends the full key; "Full history" asks by contract only. */
export async function loadThreadMessages(
  t: ChatListData,
): Promise<{ ok: boolean; messages: ChatMessage[]; error?: string }> {
  const res = await fetching({
    url: `${BASE}/specificThreadChats`,
    body: {
      threadid: t.threadid,
      messageid: t.message_id,
      ContractNo: t.ContractNo,
    },
    showLoader: false,
    isFormdata: true,
  });
  if (!res.ok) return { ok: false, messages: [], error: res.message };
  return { ok: true, messages: parseThreadMessages(res) };
}

export async function sendThreadReply(p: {
  message: string;
  /** Id of the message being replied to. */
  replyToId: string;
  sms: boolean;
  email: boolean;
}) {
  const res = await fetching({
    url: `${BASE}/replyToThreadChat`,
    body: {
      message_reply: p.message,
      message_reply_id: p.replyToId,
      IsGuest: 0,
      isSendSMS: p.sms ? 1 : 0,
      isSendEmailNow: p.email ? 1 : 0,
    },
  });
  return {
    ok: res.ok && res.success !== false,
    error: res.message as string | undefined,
  };
}

export async function sendAppRating(contractNo: string) {
  const res = await fetching({
    url: APP_RATING_URL,
    body: { ContractID: contractNo, IsGuest: 0 },
  });
  return {
    ok: res.ok && res.success !== false,
    error: res.message as string | undefined,
  };
}
