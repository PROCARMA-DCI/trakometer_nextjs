"use client";

import { usePortal } from "@/components/trakometer/portal-provider";
import { sortRows, toThread } from "@/lib/trakometer/chat";
import { loadThreadMessages } from "@/lib/trakometer/chat-api";
import type {
  ChannelId,
  ChatListData,
  ChatMessage,
  ThreadMode,
} from "@/lib/trakometer/types";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Pager } from "./chat-feed";
import { useChatUi } from "./ChatLayout";
import ConversationList from "./conversation-list";

interface Props {
  rows: ChatListData[];
  channel: ChannelId;
  loading?: boolean;
  error?: string | null;
  pager?: Pager;
}

const ChatScreen = ({
  rows,
  channel,
  loading = false,
  error = null,
  pager,
}: Props) => {
  const { search, showToast } = usePortal();
  const { alert, starred, flagged, toggleStar, toggleFlag, setThreadOpen } =
    useChatUi();
  const [newestFirst, setNewestFirst] = useState(true);
  const [selected, setSelected] = useState<ChatListData | null>(null);
  const [mode, setMode] = useState<ThreadMode>("reply");
  const [replyMsg, setReplyMsg] = useState<string | null>(null);
  const [quick, setQuick] = useState<string | null>(null);
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState<{
    id: string;
    messages: ChatMessage[];
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const all = useMemo(
    () => sortRows(rows, newestFirst).map(toThread),
    [rows, newestFirst],
  );

  // const selThread = all.find((t) => t.key === selected) ?? null;
  // const quickThread = all.find((t) => t.key === quick) ?? null;

  // Mobile: hide the channel bar while a chat is open.
  // useEffect(() => {
  //   setThreadOpen(selThread !== null);
  //   return () => setThreadOpen(false);
  // }, [selThread, setThreadOpen]);

  // Messages shown belong to the open thread + mode; until they arrive we are "loading".
  // const loadId = selThread ? `${selThread.key}|${mode}` : null;
  // const messages = loaded?.id === loadId ? loaded.messages : [];
  // const messagesLoading = loadId !== null && loaded?.id !== loadId;

  // Load the opened thread (again after a reply, or when the mode switches).
  // useEffect(() => {
  //   if (!selThread || !loadId) return;
  //   let cancelled = false;
  //   loadThreadMessages(selThread, mode).then((r) => {
  //     if (cancelled) return;
  //     if (!r.ok) {
  //       setLoaded({ id: loadId, messages: [] });
  //       return void toast.error(r.error ?? "Could not load the conversation.");
  //     }
  //     setLoaded({ id: loadId, messages: r.messages });
  //   });
  //   return () => {
  //     cancelled = true;
  //   };
  //   // Re-run on the thread's key, not on the row object.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [loadId, reloadKey]);
  console.log({ selected });
  const openRow = useCallback((item: ChatListData, m: ThreadMode) => {
    setSelected(item);
    setMode(m);
    setReplyMsg(null);
    setRead((r) => ({ ...r, [item.threadid]: true }));
    loadThreadMessages(item).then((r) => {
      if (!r.ok)
        return toast.error(r.error ?? "Could not load the conversation.");
      console.log({ r });
    });
  }, []);

  // async function reply(
  //   replyToId: string,
  //   body: string,
  //   via: { sms: boolean; email: boolean },
  // ) {
  //   const r = await sendThreadReply({ message: body, replyToId, ...via });
  //   if (!r.ok) return toast.error(r.error ?? "Could not send the reply.");
  //   showToast(
  //     "Reply sent via " +
  //       ([via.sms && "SMS", via.email && "email"].filter(Boolean).join(" + ") ||
  //         "app"),
  //   );
  //   setReplyMsg(null);
  //   setReloadKey((k) => k + 1);
  // }

  // async function appRating(contractNo: string) {
  //   const r = await sendAppRating(contractNo);
  //   if (!r.ok) return toast.error(r.error ?? "Could not send the app rating.");
  //   showToast("App rating request sent");
  // }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <ConversationList
        rows={rows}
        selected={selected}
        channel={channel}
        newestFirst={newestFirst}
        loading={loading}
        error={error}
        pager={pager}
        onToggleSort={() => setNewestFirst(!newestFirst)}
        onOpen={openRow}
        onQuick={(key) => {
          setQuick(key);
          setRead((r) => ({ ...r, [key]: true }));
        }}
      />
      {/* <ThreadPanel
        thread={selThread}
        messages={messages}
        loading={messagesLoading}
        mode={mode}
        onMode={(m) => {
          setMode(m);
          setReplyMsg(null);
        }}
        onBack={() => setSelected(null)}
        starred={starred}
        flagged={flagged}
        replyMsg={replyMsg}
        onStar={toggleStar}
        onFlag={toggleFlag}
        onReply={setReplyMsg}
        onCancelReply={() => setReplyMsg(null)}
        onSend={(body, via) => replyMsg && reply(replyMsg, body, via)}
        onAppRating={() => selThread && appRating(selThread.contractNo)}
      /> */}

      {/* {quickThread && (
        <QuickReplyModal
          thread={quickThread}
          starred={!!starred[quickThread.messageId]}
          onStar={() => toggleStar(quickThread.messageId)}
          onClose={() => setQuick(null)}
          onOpenThread={() => {
            setQuick(null);
            openRow(quickThread.key, "reply");
          }}
          onAppRating={() => appRating(quickThread.contractNo)}
          onSend={async (body, email) => {
            await reply(quickThread.messageId, body, { sms: false, email });
            setQuick(null);
          }}
        />
      )} */}
    </div>
  );
};

export default ChatScreen;
