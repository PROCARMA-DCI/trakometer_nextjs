"use client";

import { Button } from "@/components/ui/button";
import { fetching } from "@/lib/api/client";
import type { RangeKey } from "@/lib/trakometer/types";
import { Gauge, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

// The host app embeds us as `?id=<token>`.
const TOKEN_PARAM = "id";

/** checking = saving the `?id=` token · ready = session set up · denied = missing/invalid token */
type AuthStatus = "checking" | "ready" | "denied";

interface PortalCtx {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  search: string;
  setSearch: (s: string) => void;
  /** `search`, debounced — use this for anything sent to the server. */
  searchTerm: string;
  online: boolean;
  setOnline: (o: boolean) => void;
  showToast: (t: string) => void;
  /**
   * Call when any backend request answers 401/403: stale cookie → login page,
   * bad `?id=` token → "Session not valid" screen.
   */
  unauthorized: (message?: string) => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<PortalCtx | null>(null);

export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal must be used inside <PortalProvider>");
  return c;
}

/**
 * Wraps every portal page and boots the session:
 *  1. `?id=<token>` in the URL → saved in an httpOnly cookie, then removed from the URL
 *  2. children render once that is done; each screen calls its own API and reports
 *     a 401/403 through `unauthorized()` (the dashboard call lives in the overview)
 */
export function PortalProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<RangeKey>("30");
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(true);

  const [status, setStatus] = useState<AuthStatus>("checking");
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);
  const router = useRouter();
  const showToast = (msg: string) => toast.success(msg);

  // Search is applied server-side, so debounce it.
  const [searchTerm, setSearchTerm] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // 1. Save the token from the URL (guarded: StrictMode runs effects twice).
  const booted = useRef(false);
  const usedUrlToken = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get(TOKEN_PARAM);
      usedUrlToken.current = Boolean(token);
      if (token) {
        const res = await fetching({
          url: "/api/auth/session",
          body: { token },
          isFormdata: false,
          showLoader: false,
        });

        if (!res.ok) {
          setStatus("denied");
          return;
        }
      }
      // No `id` → rely on the cookie (proxy.ts already ensured one exists).
      if (token) {
        // Token is saved → keep it out of the address bar / history.
        url.searchParams.delete(TOKEN_PARAM);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
      setStatus("ready");
    })();
  }, []);

  const unauthorized = useCallback(
    (message?: string) => {
      // Stale/invalid cookie from a normal visit → sign in again; a bad `?id=` token shows the error screen.
      if (!usedUrlToken.current) {
        router.replace("/login");
        return;
      }
      setDeniedMessage(message ?? null);
      setStatus("denied");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetching({ url: "/api/auth/logout", showLoader: false });
    setStatus("denied");
  }, []);

  if (status !== "ready") {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
        {status === "checking" ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Gauge className="size-8 text-primary" />
            <Loader2 className="size-5 animate-spin" />
            <p className="text-sm">Signing you in…</p>
          </div>
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-3 text-center">
            <ShieldAlert className="size-8 text-destructive" />
            <h1 className="text-lg font-semibold">Session not valid</h1>
            <p className="text-sm text-muted-foreground">
              {deniedMessage ??
                "Your access token is missing or has expired. Please reopen Trakometer from the main application."}
            </p>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Try with Login
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Ctx.Provider
      value={{
        range,
        setRange,
        search,
        setSearch,
        searchTerm,
        online,
        setOnline,
        showToast,
        unauthorized,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
