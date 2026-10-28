"use client";
import { ChatFeedProvider } from "@/components/trakometer/chat/chat-feed";
import type { ReactNode } from "react";
import { tradeFeed } from "./feed";

export default function TradeLayout({ children }: { children: ReactNode }) {
  return <ChatFeedProvider feed={tradeFeed}>{children}</ChatFeedProvider>;
}
