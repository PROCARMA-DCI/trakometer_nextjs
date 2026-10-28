"use client";
import type { ReactNode } from "react";

import { TradeProvider } from "./useTrade";

export default function NguageLayout({ children }: { children: ReactNode }) {
  return <TradeProvider>{children}</TradeProvider>;
}
