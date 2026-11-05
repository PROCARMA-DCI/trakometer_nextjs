"use client";
import { ChatFeedProvider } from "@/components/trakometer/chat/chat-feed";
import type { ReactNode } from "react";
import { notificationFeed } from "./feed";

export default function NotificationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ChatFeedProvider feed={notificationFeed}>{children}</ChatFeedProvider>
  );
}
