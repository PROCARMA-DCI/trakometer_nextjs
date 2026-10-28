"use client";
import type { ReactNode } from "react";
import { NguageProvider } from "./useNguage";

export default function NguageLayout({ children }: { children: ReactNode }) {
  return <NguageProvider>{children}</NguageProvider>;
}
