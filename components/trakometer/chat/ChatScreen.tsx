import { ChannelId, ChatListData } from "@/lib/trakometer/types";
import ConversationList from "./conversation-list";
import QuickReplyModal from "./quick-reply-modal";
import ServicePlusModal from "./service-plus-modal";
import ThreadPanel from "./thread-panel";

interface Props {
  rows: ChatListData;
  channel: ChannelId;
}
const ChatScreen = ({ rows, channel }: Props) => {
  return (
    <div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
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
          onQuick={(n) => {
            setQuick(n);
            setRead((r) => ({ ...r, [n]: true }));
          }}
          onConfirm={(n) => {
            openRow(n, "reply");
            setServiceModal(true);
          }}
          onDecline={() => showToast("Appointment request declined")}
        />
        <ThreadPanel
          row={selRow}
          mode={mode}
          onMode={(m) => {
            setMode(m);
            setReplyMsg(null);
          }}
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

      {quickRow && (
        <QuickReplyModal
          message={msgById[quickRow.msg]}
          starred={!!starred[quickRow.msg]}
          onStar={() => toggle(setStarred)(quickRow.msg)}
          onClose={() => setQuick(null)}
          onOpenThread={() => {
            setQuick(null);
            openRow(quickRow.n, "reply");
          }}
          onSend={(body, email) => {
            const m = msgById[quickRow.msg];
            addReply(
              m.contact,
              body,
              quickRow.msg,
              "Reply sent to " +
                CONTACTS[m.contact].name +
                (email ? " via email and app" : " via app"),
            );
            setQuick(null);
          }}
        />
      )}

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
};

export default ChatScreen;
