"use client";

import { usePortal } from "@/components/trakometer/portal-provider";
import { fetching, type ApiResult } from "@/lib/api/client";
import type {
  ChannelId,
  ChatListData,
  Pagination,
  RangeKey,
} from "@/lib/trakometer/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ChatLayout from "./ChatLayout";

/** What differs between chat channels: which API to call and how to read its answer. */
export interface ChatFeed {
  channel: ChannelId;
  url: string;
  body: (p: {
    range: RangeKey;
    search: string;
    limit: number;
    offset: number;
  }) => Record<string, unknown>;
  /** `total` = all records when the API reports it; otherwise a full page implies "more". */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse: (res: Record<string, any>) => {
    rows: ChatListData[];
    pagination: Pagination;
  };
}

export const PAGE_SIZE = 20;

export interface Pager {
  page: number; // 0-based
  pageSize: number;
  total: number | null;
  limit: number | null;
  offset: number | null;
  hasNext: boolean;
  onPage: (page: number) => void;
}

interface FeedCtx {
  rows: ChatListData[];
  pager: Pager;
  loading: boolean;
  error: string | null;
}

const Ctx = createContext<FeedCtx | null>(null);

export function useChatFeed() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useChatFeed must be used inside <ChatFeedProvider>");
  return c;
}

/** Loads a channel's list, owns refresh, and wraps the page in the shared chat layout. */
export function ChatFeedProvider({
  feed,
  children,
}: {
  feed: ChatFeed;
  children: ReactNode;
}) {
  const { range, searchTerm, unauthorized } = usePortal();
  const [rows, setRows] = useState<ChatListData[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  // A new range / search starts again from page 1.
  const filterKey = `${range}|${searchTerm}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 });
  const page = pageState.key === filterKey ? pageState.page : 0;

  // Refetch only when the request itself changes (a feed that ignores search won't refire on typing).
  const body = JSON.stringify(
    feed.body({
      range,
      search: searchTerm,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
  );
  const { url, parse } = feed;

  // StrictMode (dev) runs effects twice; refs survive that, so reuse the in-flight request
  // instead of sending an identical second one. `reloadKey` in the key keeps Refresh working.
  const inflight = useRef<{ key: string; promise: Promise<ApiResult> } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const key = `${url}|${body}|${reloadKey}`;
      if (inflight.current?.key !== key) {
        inflight.current = {
          key,
          promise: fetching({ url, body: JSON.parse(body), setLoading }),
        };
      }
      const res = await inflight.current.promise;
      if (cancelled) return;
      if (res.status === 401 || res.status === 403) {
        setRows([]);
        unauthorized(res.message);
        return;
      }
      if (!res.ok || res.success === false) {
        setRows([]);
        setError(res.message ?? "Could not load chats.");
        return;
      }
      const parsed = parse(res);
      setError(null);
      setRows(parsed.rows);
      setTotal(parsed?.pagination?.total ?? null);
      setLimit(parsed?.pagination?.limit ?? PAGE_SIZE);
      setOffset(parsed?.pagination?.offset ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [url, body, parse, reloadKey, unauthorized]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <Ctx.Provider
      value={{
        rows,
        loading,
        error,
        pager: {
          page,
          pageSize: limit ?? PAGE_SIZE,
          total,
          limit,
          offset,
          hasNext:
            total !== null
              ? (page + 1) * PAGE_SIZE < total
              : rows.length >= PAGE_SIZE,
          onPage: (p) => setPageState({ key: filterKey, page: p }),
        },
      }}
    >
      <ChatLayout channel={feed.channel} spinning={loading} onRefresh={reload}>
        {children}
      </ChatLayout>
    </Ctx.Provider>
  );
}
