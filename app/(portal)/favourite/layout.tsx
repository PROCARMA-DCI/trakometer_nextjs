"use client";
import { ChatFeedProvider } from "@/components/trakometer/chat/chat-feed";
import type { ReactNode } from "react";
import { favouriteFeed } from "./feed";

export default function NguageLayout({ children }: { children: ReactNode }) {
  return <ChatFeedProvider feed={favouriteFeed}>{children}</ChatFeedProvider>;
}
