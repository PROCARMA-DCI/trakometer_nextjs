"use client";
import { ChatFeedProvider } from "@/components/trakometer/chat/chat-feed";
import type { ReactNode } from "react";
import { chatFeed } from "./feed";

export default function ServiceLayout({ children }: { children: ReactNode }) {
  return <ChatFeedProvider feed={chatFeed}>{children}</ChatFeedProvider>;
}
