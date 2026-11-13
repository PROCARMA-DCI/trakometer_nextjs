"use client";
import { ChatFeedProvider } from "@/components/trakometer/chat/chat-feed";
import type { ReactNode } from "react";
import { kanopiFeed } from "./feed";

export default function KanopiLayout({ children }: { children: ReactNode }) {
  return <ChatFeedProvider feed={kanopiFeed}>{children}</ChatFeedProvider>;
}
