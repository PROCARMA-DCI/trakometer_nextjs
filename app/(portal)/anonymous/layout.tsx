"use client";
import { ChatFeedProvider } from "@/components/trakometer/chat/chat-feed";
import type { ReactNode } from "react";
import { anonymousFeed } from "./feed";

export default function NotificationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ChatFeedProvider feed={anonymousFeed}>{children}</ChatFeedProvider>
  );
}
