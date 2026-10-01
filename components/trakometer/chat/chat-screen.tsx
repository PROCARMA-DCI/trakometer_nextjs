"use client";

import { CHAT_ROWS, CONTACTS, MESSAGES } from "@/lib/trakometer/data";
import type { AlertFilter, ChannelId, Message } from "@/lib/trakometer/types";
import { fmtTime } from "@/lib/trakometer/utils";
import { Unplug } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { usePortal } from "../portal-provider";
import ChannelBar from "./channel-bar";
import ConversationList from "./conversation-list";
import ServicePlusModal from "./service-plus-modal";
import ThreadPanel from "./thread-panel";

export type Flags = Record<string, boolean>;

export default function ChatScreen() {
  const { search, online, showToast } = usePortal();
  const [channel, setChannel] = useState<ChannelId>("service");
  const [push, setPush] = useState(false);
  const [alert, setAlert] = useState<AlertFilter>(null);
  const [spinning, setSpinning] = useState(false);
  const [newestFirst, setNewestFirst] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [replyMsg, setReplyMsg] = useState<string | null>(null);
  const [draftSeed, setDraftSeed] = useState("");
  const [serviceModal, setServiceModal] = useState(false);
  const [starred, setStarred] = useState<Flags>({});
  const [flagged, setFlagged] = useState<Flags>({ h1: true });
  const [confirmed, setConfirmed] = useState<Flags>({});
  const [deleted, setDeleted] = useState<Flags>({});
  const [read, setRead] = useState<Record<number, boolean>>({});
  const [extra, setExtra] = useState<Message[]>([]);

  const msgById = useMemo(
    () => Object.fromEntries(MESSAGES.map((m) => [m.id, m])),
    [],
  );
  const toggle = (set: Dispatch<SetStateAction<Flags>>) => (id: string) =>
    set((f) => ({ ...f, [id]: !f[id] }));

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    let r = CHAT_ROWS.filter((x) => !deleted[x.msg]);
    if (alert === "star") r = r.filter((x) => starred[x.msg]);
    if (alert === "new") r = r.filter((x) => x.unread && !read[x.n]);
    if (alert === "flag") r = r.filter((x) => flagged[x.msg]);
    if (s) {
      r = r.filter((x) => {
        const c = CONTACTS[msgById[x.msg].contact];
        return (c.name + " " + c.dealer + " " + c.id).toLowerCase().includes(s);
      });
    }
    return newestFirst ? r : r.slice().reverse();
  }, [search, alert, starred, flagged, read, deleted, newestFirst, msgById]);

  const all = CHAT_ROWS.filter((x) => !deleted[x.msg]);
  const counts = {
    star: all.filter((x) => starred[x.msg]).length,
    new: all.filter((x) => x.unread && !read[x.n]).length,
    flag: all.filter((x) => flagged[x.msg]).length,
  };

  function openRow(n: number) {
    setSelected(n);
    setReplyMsg(null);
    setDraftSeed("");
    setRead((r) => ({ ...r, [n]: true }));
  }

  function addReply(
    contact: string,
    body: string,
    replyOf?: string,
    via?: string,
  ) {
    const tel =
      contact === "hunter"
        ? { tel: "(601)-273-4183", service: "(601) 273-4183" }
        : {};
    setExtra((x) => [
      ...x,
      {
        id: "x" + Date.now(),
        contact,
        from: "agent",
        date: "Sep 25 2026",
        time: fmtTime(new Date()),
        body,
        replyOf,
        ...tel,
      },
    ]);
    showToast(via || "Reply sent");
  }

  const selRow =
    CHAT_ROWS.find((r) => r.n === selected && !deleted[r.msg]) || null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className={selected !== null ? "hidden md:block" : undefined}>
        <ChannelBar
          channel={channel}
          onChannel={setChannel}
          push={push}
          onPush={() => setPush(!push)}
          alert={alert}
          onAlert={(a) => setAlert((cur) => (cur === a ? null : a))}
          counts={counts}
          spinning={spinning}
          onRefresh={() => {
            setSpinning(true);
            setAlert(null);
            setTimeout(() => {
              setSpinning(false);
              showToast("Notifications refreshed");
            }, 800);
          }}
        />
      </div>
      {!online && (
        <div className="flex items-center gap-2 border-b bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <Unplug className="size-4 shrink-0" />
          You&apos;re offline. New customer chats won&apos;t be routed to you
          until you switch back online.
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          rows={rows}
          msgById={msgById}
          selected={selected}
          read={read}
          starred={starred}
          flagged={flagged}
          confirmed={confirmed}
          channel={channel}
          newestFirst={newestFirst}
          onToggleSort={() => setNewestFirst(!newestFirst)}
          onOpen={openRow}
          onConfirm={(n) => {
            openRow(n);
            setServiceModal(true);
          }}
          onDecline={() => showToast("Appointment request declined")}
        />
        <ThreadPanel
          row={selRow}
          onBack={() => setSelected(null)}
          msgById={msgById}
          extra={extra}
          deleted={deleted}
          starred={starred}
          flagged={flagged}
          confirmed={confirmed}
          replyMsg={replyMsg}
          draftSeed={draftSeed}
          onStar={toggle(setStarred)}
          onFlag={toggle(setFlagged)}
          onReply={(id) => {
            setReplyMsg(id);
            setDraftSeed("");
          }}
          onEdit={(id, body) => {
            setReplyMsg(id);
            setDraftSeed(body);
          }}
          onDelete={(id) => {
            setDeleted((d) => ({ ...d, [id]: true }));
            showToast("Message deleted");
          }}
          onCancelReply={() => setReplyMsg(null)}
          onSend={(contact, body, via) => {
            addReply(contact, body, replyMsg ?? undefined, via);
            setReplyMsg(null);
          }}
          onOpenSchedule={() => setServiceModal(true)}
        />
      </div>

      {serviceModal && selRow && (
        <ServicePlusModal
          message={msgById[selRow.msg]}
          onClose={() => setServiceModal(false)}
          onSubmit={(body) => {
            const m = msgById[selRow.msg];
            setConfirmed((c) => ({ ...c, [m.id]: true }));
            addReply(
              m.contact,
              body ||
                "Your appointment is confirmed for Friday, Sep 25 2026 at 01:00 PM. See you then!",
              m.id,
              "Appointment confirmed and customer notified",
            );
            setServiceModal(false);
            setReplyMsg(null);
          }}
        />
      )}
    </div>
  );
}
