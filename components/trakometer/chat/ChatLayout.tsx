"use client";

import { usePortal } from "@/components/trakometer/portal-provider";
import type { AlertFilter, ChannelId } from "@/lib/trakometer/types";
import { Unplug } from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import ChannelBar from "./channel-bar";

export type Flags = Record<string, boolean>;

/** Channel-bar state the screen below needs (filter, local star/flag marks, mobile "chat open"). */
interface ChatUi {
  alert: AlertFilter;
  starred: Flags;
  flagged: Flags;
  toggleStar: (key: string) => void;
  toggleFlag: (key: string) => void;
  setThreadOpen: (open: boolean) => void;
}

const Ctx = createContext<ChatUi | null>(null);

export function useChatUi() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useChatUi must be used inside <ChatLayout>");
  return c;
}

const toggle = (set: Dispatch<SetStateAction<Flags>>) => (key: string) =>
  set((f) => ({ ...f, [key]: !f[key] }));

const ChatLayout = ({
  channel,
  spinning,
  onRefresh,
  children,
}: {
  channel: ChannelId;
  spinning: boolean;
  onRefresh: () => void;
  children: ReactNode;
}) => {
  const { online, showToast } = usePortal();
  const [push, setPush] = useState(false);
  const [alert, setAlert] = useState<AlertFilter>(null);
  const [starred, setStarred] = useState<Flags>({});
  const [flagged, setFlagged] = useState<Flags>({});
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <Ctx.Provider
      value={{
        alert,
        starred,
        flagged,
        toggleStar: toggle(setStarred),
        toggleFlag: toggle(setFlagged),
        setThreadOpen,
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4">
        <div className={threadOpen ? "hidden md:block" : undefined}>
          <ChannelBar
            channel={channel}
            push={push}
            onPush={() => setPush(!push)}
            alert={alert}
            onAlert={(a) => setAlert((cur) => (cur === a ? null : a))}
            spinning={spinning}
            onRefresh={() => {
              setAlert(null);
              onRefresh();
              showToast("Notifications refreshed");
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
        {children}
      </div>
    </Ctx.Provider>
  );
};

export default ChatLayout;
