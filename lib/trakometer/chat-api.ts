// Chat calls that every channel shares (open a thread, reply, send app rating).
// Channel-specific list calls live next to their page (app/(portal)/<channel>/feed.ts).

import { fetching } from "@/lib/api/client";

import { toast } from "sonner";
import type { ChatListData, ReplyLoadThreadMessage } from "./types";

const BASE = "/api/react/Trakometer";

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

  if (!res || res.success === false) {
    toast.error(res.message ?? "Could not load the conversation.");
    throw new Error(res.message ?? "Could not load the conversation.");
  }

  return res as unknown as ReplyLoadThreadMessage;
}

export async function sendThreadReply(p: {
  message_reply: string;
  /** Id of the message being replied to. */
  message_id: string;
  isSendSMS: boolean;
  isSendEmailNow: boolean;
  IsGuest: boolean;
}) {
  const res = await fetching({
    url: `${BASE}/replyToThreadChat`,
    body: {
      message_reply: p.message_reply,
      message_reply_id: p.message_id,
      IsGuest: p.IsGuest,
      isSendSMS: p.isSendSMS ? 1 : 0,
      isSendEmailNow: p.isSendEmailNow ? 1 : 0,
    },
  });
  return {
    ok: res.ok && res.success !== false,
    error: res.message as string | undefined,
  };
}

export async function sendAppRating(contractNo: string, IsGuest: boolean) {
  const res = await fetching({
    url: `${BASE}/appratingsend`,
    body: { ContractID: contractNo, IsGuest: IsGuest },
  });
  return {
    ok: res.ok && res.success !== false,
    message: res.message as string | undefined,
    error: res.message as string | undefined,
  };
}
