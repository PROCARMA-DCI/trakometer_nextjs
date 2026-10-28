import ChannelBar from "@/components/trakometer/chat/channel-bar";
import { Flags } from "@/components/trakometer/chat/chat-screen";
import { usePortal } from "@/components/trakometer/portal-provider";
import { AlertFilter, ChannelId } from "@/lib/trakometer/types";
import { useState } from "react";

const ChatLayout = ({
  children,
  // CHAT_ROWS,
}: {
  children: React.ReactNode;
  // CHAT_ROWS: any;
}) => {
  const { showToast } = usePortal();
  const [channel, setChannel] = useState<ChannelId>("ngauge");
  const [starred, setStarred] = useState<Flags>({});
  const [deleted, setDeleted] = useState<Flags>({});
  const [flagged, setFlagged] = useState<Flags>({ h1: true });
  const [read, setRead] = useState<Record<number, boolean>>({});
  const [push, setPush] = useState(false);
  const [alert, setAlert] = useState<AlertFilter>(null);
  const [spinning, setSpinning] = useState(false);
  // const all = CHAT_ROWS.filter((x) => !deleted[x.msg]);
  // const counts = {
  //   star: all.filter((x) => starred[x.msg]).length,
  //   new: all.filter((x) => x.unread && !read[x.n]).length,
  //   flag: all.filter((x) => flagged[x.msg]).length,
  // };
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div>
        <ChannelBar
          channel={channel}
          onChannel={setChannel}
          push={push}
          onPush={() => setPush(!push)}
          alert={alert}
          onAlert={(a) => setAlert((cur) => (cur === a ? null : a))}
          // counts={counts}
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
      {children}
    </div>
  );
};

export default ChatLayout;
