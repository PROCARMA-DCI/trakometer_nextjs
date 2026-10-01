"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { RangeKey } from "@/lib/trakometer/types";

interface PortalCtx {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  search: string;
  setSearch: (s: string) => void;
  online: boolean;
  setOnline: (o: boolean) => void;
  showToast: (t: string) => void;
}

const Ctx = createContext<PortalCtx | null>(null);

export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal must be used inside <PortalProvider>");
  return c;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<RangeKey>("30 DAY");
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(true);

  const showToast = (msg: string) => toast.success(msg);

  return (
    <Ctx.Provider value={{ range, setRange, search, setSearch, online, setOnline, showToast }}>
      {children}
    </Ctx.Provider>
  );
}
