"use client";
import { ChatFeedProvider } from "@/components/trakometer/chat/chat-feed";
import type { ReactNode } from "react";
import { flagFeed } from "./feed";

export default function FlagLayout({ children }: { children: ReactNode }) {
  return <ChatFeedProvider feed={flagFeed}>{children}</ChatFeedProvider>;
}
