"use client";

import { fetching } from "@/lib/api/client";
import type { DashboardData } from "@/lib/trakometer/types";
import { useEffect, useState } from "react";
import { usePortal } from "../portal-provider";

const DASHBOARD_URL = "/api/react/Trakometer/dashboardData";

/** Dashboard payload for the overview; refetches on range / search / category change. */
export function useDashboard(categoryIds: string) {
  const { range, searchTerm, unauthorized } = usePortal();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      });
      if (cancelled) return;
      if (res.status === 401 || res.status === 403) {
        setData(null);
        unauthorized(res.message);
        return;
      }
      if (!res.ok || !res.success) {
        setError(res.message ?? "Could not load dashboard data.");
        return;
      }
      setError(null);
      setData(res);
    })();
    return () => {
      cancelled = true;
    };
  }, [range, searchTerm, categoryIds, unauthorized]);

  return { data, error };
}
