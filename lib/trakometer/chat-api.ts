// Chat calls that every channel shares (open a thread, reply, send app rating).
// Channel-specific list calls live next to their page (app/(portal)/<channel>/feed.ts).

import { fetching } from "@/lib/api/client";

import { toast } from "sonner";
import type { ChatListData, ReplyLoadThreadMessage } from "./types";

const BASE = "/api/react/Trakometer";
const APP_RATING_URL = `${BASE}/appRatingSend`;

/** "This thread" sends the full key; "Full history" asks by contract only. */
export async function replyLoadThreadMessages(
  t: ChatListData,
): Promise<ReplyLoadThreadMessage> {
  const res = await fetching({
    url: `${BASE}/specificThreadChats`,
    body: {
      threadid: t.threadid,
      messageid: t.message_id,
      ContractNo: t.ContractNo,
    },
    showLoader: true,
    isFormdata: true,
  });

  if (res.success === false) {
    toast.error(res.message ?? "Could not load the conversation.");
    throw new Error(res.message ?? "Could not load the conversation.");
  }

  return res as unknown as ReplyLoadThreadMessage;
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
