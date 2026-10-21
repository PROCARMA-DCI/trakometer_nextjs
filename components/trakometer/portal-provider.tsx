"use client";

import { Button } from "@/components/ui/button";
import { fetching } from "@/lib/api/client";
import type { DashboardData, RangeKey } from "@/lib/trakometer/types";
import { Gauge, Loader2, ShieldAlert } from "lucide-react";
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

const DASHBOARD_URL = "/api/react/Trakometer/dashboardData";
// The host app embeds us as `?id=<token>`.
const TOKEN_PARAM = "id";

/** checking = saving token / validating · ready = token valid · denied = missing/invalid token */
type AuthStatus = "checking" | "ready" | "denied";

interface PortalCtx {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  search: string;
  setSearch: (s: string) => void;
  online: boolean;
  setOnline: (o: boolean) => void;
  showToast: (t: string) => void;
  /** Latest dashboard payload (also what validates the token). */
  dashboard: DashboardData | null;
  dashboardError: string | null;
  /** Comma-separated TrakoCategoryIDs sent to the dashboard call ("" = no filter). */
  setCategoryIds: (ids: string) => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<PortalCtx | null>(null);

export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal must be used inside <PortalProvider>");
  return c;
}

/**
 * One place that boots the portal:
 *  1. `?id=<token>` in the URL → saved in an httpOnly cookie, then removed from the URL
 *  2. dashboard call (re-run on range / search / category change) — a 401 or failure
 *     means the token is invalid, so the portal is not shown
 *  3. children render only once the token is valid
 */
export function PortalProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<RangeKey>("30");
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(true);
  const [categoryIds, setCategoryIds] = useState("");

  const [sessionReady, setSessionReady] = useState(false);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const showToast = (msg: string) => toast.success(msg);

  // Search is applied server-side, so debounce it.
  const [searchTerm, setSearchTerm] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // 1. Save the token from the URL (guarded: StrictMode runs effects twice).
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get(TOKEN_PARAM);
      if (token) {
        const res = await fetching({
          url: "/api/auth/session",
          body: { token },
          isFormdata: false,
          showLoader: false,
        });
        // Keep the token out of the address bar / history either way.
        url.searchParams.delete(TOKEN_PARAM);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        if (!res.ok) {
          setStatus("denied");
          return;
        }
      }
      // No `id` → rely on a cookie saved earlier; the dashboard call validates it.
      setSessionReady(true);
    })();
  }, []);

  // 2. Dashboard call = token validation.
  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    (async () => {
      const res = await fetching<DashboardData>({
        url: DASHBOARD_URL,
        method: "POST",
        body: {
          FixedDateParaMater: range,
          TrakoCategoryID: categoryIds,
          DealerTitle: searchTerm,
        },
        isFormdata: true,
        showLoader: status === "ready", // first call shows the boot screen instead
      });
      if (cancelled) return;
      if (res.status === 401 || res.status === 403) {
        setDashboard(null);
        setStatus("denied");
        return;
      }
      if (!res.ok || !res.success) {
        // Token is fine (not a 401) but the data call failed — keep the portal up.
        setDashboardError(res.message ?? "Could not load dashboard data.");
        setStatus((s) => (s === "checking" ? "denied" : s));
        return;
      }
      setDashboardError(null);
      setDashboard(res);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
    // `status` only picks the loader style; it must not retrigger the call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady, range, searchTerm, categoryIds]);

  const logout = useCallback(async () => {
    await fetching({ url: "/api/auth/logout", showLoader: false });
    setDashboard(null);
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
              {dashboardError ??
                "Your access token is missing or has expired. Please reopen Trakometer from the main application."}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
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
        online,
        setOnline,
        showToast,
        dashboard,
        dashboardError,
        setCategoryIds,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
