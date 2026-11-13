"use client";

import { fetching } from "@/lib/api/client";
import type { DashboardData } from "@/lib/trakometer/types";
import { useEffect, useRef, useState } from "react";
import { usePortal } from "../portal-provider";

const DASHBOARD_URL = "/api/react/Trakometer/dashboardData";

type DashboardResponse = Awaited<ReturnType<typeof fetching<DashboardData>>>;

// Dedupes identical concurrent requests (StrictMode remount, multiple consumers).
const inflight = new Map<string, Promise<DashboardResponse>>();

function loadDashboard(body: Record<string, unknown>) {
  const key = JSON.stringify(body);
  let promise = inflight.get(key);
  if (!promise) {
    promise = fetching<DashboardData>({
      url: DASHBOARD_URL,
      method: "POST",
      body,
      isFormdata: true,
    }).finally(() => inflight.delete(key));
    inflight.set(key, promise);
  }
  return promise;
}

/** Dashboard payload for the overview; refetches on range / search / category change. */
export function useDashboard(categoryIds: string) {
  const { range, searchTerm, unauthorized } = usePortal();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callback without making it an effect dependency.
  const unauthorizedRef = useRef(unauthorized);
  useEffect(() => {
    unauthorizedRef.current = unauthorized;
  }, [unauthorized]);

  useEffect(() => {
    let cancelled = false;

    loadDashboard({
      FixedDateParaMater: range,
      TrakoCategoryID: categoryIds,
      DealerTitle: searchTerm,
    }).then((res) => {
      if (cancelled) return;
      if (res.status === 401 || res.status === 403) {
        setData(null);
        unauthorizedRef.current(res.message);
        return;
      }
      if (!res.ok || !res.success) {
        setError(res.message ?? "Could not load dashboard data.");
        return;
      }
      setError(null);
      setData(res);
    });

    return () => {
      cancelled = true;
    };
  }, [range, searchTerm, categoryIds]);

  return { data, error };
}
