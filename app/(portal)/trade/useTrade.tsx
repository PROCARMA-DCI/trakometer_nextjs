"use client";
import ChatLayout from "@/components/trakometer/chat/ChatLayout";
import { usePortal } from "@/components/trakometer/portal-provider";
import { fetching } from "@/lib/api/client";
import { ChatListData, Pagination } from "@/lib/trakometer/types";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface NguageCtx {
  chatData?: ChatListData | null;
  error: string | null;
}

const Ctx = createContext<NguageCtx | null>(null);

interface TradePagination extends Pagination {
  total_records: number;
  total_pages: number;
}
interface fetchData {
  success: boolean;
  message: string;
  data: TradePagination;
  notifications: ChatListData;
}
export function useTrade() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTrade must be used inside ");
  return c;
}
export function TradeProvider({ children }: { children: ReactNode }) {
  const { range, search } = usePortal();
  const [chatData, setChatData] = useState<ChatListData | null>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetching<fetchData>({
        url: "/api/react/Trakometer/vmtNotificationsList",
        method: "POST",
        body: {
          limit: 20,
          offset: "",
          fixed_parameter: range,
          dealer_title: "",
        },
        isFormdata: true,
      });
      if (cancelled) return;
      if (res.status === 401 || res.status === 403) {
        setChatData(null);
        return;
      }
      if (!res.ok || !res.success) {
        // Token is fine (not a 401) but the data call failed — keep the portal up.
        setError(res?.message ?? "Could not load data.");
        return;
      }
      setError(null);
      setChatData(res.notifications);
    })();
    return () => {
      cancelled = true;
    };
  }, [range, search]);
  console.log(chatData);
  return (
    <Ctx.Provider
      value={{
        chatData,
        error,
      }}
    >
      <ChatLayout>{children}</ChatLayout>
    </Ctx.Provider>
  );
}
