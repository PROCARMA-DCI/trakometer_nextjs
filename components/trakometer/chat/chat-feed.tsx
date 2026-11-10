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
export interface ChatFeed<T = ChatListData> {
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
    rows: T[];
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
  /** Zero-based index of the first loaded row overall (page 2 → 20), for row numbering. */
  startIndex: number;
  hasNext: boolean;
  onPage: (page: number) => void;
  /** Infinite scroll: fetch the next page and append it. */
  onLoadMore: () => void;
}

interface FeedCtx<T = ChatListData> {
  rows: T[];
  pager: Pager;
  loading: boolean;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ctx = createContext<FeedCtx<any> | null>(null);

/** `T` is the row type of the feed (ChatListData unless the channel says otherwise). */
export function useChatFeed<T = ChatListData>() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useChatFeed must be used inside <ChatFeedProvider>");
  return c as FeedCtx<T>;
}

/** Loads a channel's list, owns refresh, and wraps the page in the shared chat layout. */
export function ChatFeedProvider<T = ChatListData>({
  feed,
  children,
}: {
  feed: ChatFeed<T>;
  children: ReactNode;
}) {
  const { range, searchTerm, unauthorized } = usePortal();
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  // Set together with the rows (not on click) so numbers don't shift before the data arrives.
  const [startIndex, setStartIndex] = useState(0);

  // A new range / search starts again from page 1.
  const filterKey = `${range}|${searchTerm}`;
  // `from` = first page of the loaded window, `page` = last loaded page. A page
  // jump starts a new window at that page; scrolling appends the pages after it.
  const [pageState, setPageState] = useState({
    key: filterKey,
    page: 0,
    from: 0,
  });
  const current = pageState.key === filterKey;
  const page = current ? pageState.page : 0;
  const from = current ? pageState.from : 0;

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
  const inflight = useRef<{ key: string; promise: Promise<ApiResult> } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const key = `${url}|${body}|${reloadKey}`;
      if (inflight.current?.key !== key) {
        inflight.current = {
          key,
          promise: fetching({
            url,
            body: JSON.parse(body),
            badgeLoading: "chat-loading",
          }),
        };
      }
      const res = await inflight.current.promise;

      if (cancelled) return;
      setLoading(false);
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
      // The window's first page replaces the list; later pages are appended (infinite scroll).
      setRows((prev) =>
        page === from ? parsed.rows : [...prev, ...parsed.rows],
      );
      if (page === from) setStartIndex(from * PAGE_SIZE);
      setTotal(parsed?.pagination?.total ?? null);
      setLimit(parsed?.pagination?.limit ?? PAGE_SIZE);
      setOffset(parsed?.pagination?.offset ?? 0);
    })();
    return () => {
      cancelled = true;
    };
    // `page` changes together with `body` (offset), so it never fires on its own;
    // `from` only changes together with `page`, so it is read but not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, body, page, parse, reloadKey, unauthorized]);

  // Refresh starts again from the first page.
  const reload = useCallback(() => {
    setPageState({ key: filterKey, page: 0, from: 0 });
    setReloadKey((k) => k + 1);
  }, [filterKey]);

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
          startIndex,
          hasNext:
            total !== null
              ? (page + 1) * PAGE_SIZE < total
              : rows.length >= (page + 1) * PAGE_SIZE,
          // Jump: reload from page `p` (0-based) and continue from there on scroll.
          onPage: (p) => {
            if (p === page) return;
            setPageState({ key: filterKey, page: p, from: p });
          },
          onLoadMore: () =>
            setPageState({ key: filterKey, page: page + 1, from }),
        },
      }}
    >
      <ChatLayout channel={feed.channel} spinning={loading} onRefresh={reload}>
        {children}
      </ChatLayout>
    </Ctx.Provider>
  );
}
