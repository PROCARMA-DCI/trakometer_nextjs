"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Gauge, MessagesSquare, Search, X, Globe, LogOut } from "lucide-react";
import { usePortal } from "./portal-provider";
import { browserTimeZone } from "@/lib/trakometer/utils";
import type { RangeKey } from "@/lib/trakometer/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const RANGES: RangeKey[] = ["ITD", "YTD", "MTD", "30 DAY"];

export default function TopBar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const isEmbedded = pathname.startsWith("/test");
  const localPath = isEmbedded ? pathname.replace(/^\/test/, "") || "/" : pathname;
  const isChats = localPath.startsWith("/chats");
  const base = isEmbedded ? "/test" : "";

  const { range, setRange, search, setSearch, online, setOnline } = usePortal();
  const [q, setQ] = useState(search);
  const [tz, setTz] = useState("");
  useEffect(() => {
    // Client-only value (differs per browser) — must run post-hydration to avoid a server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTz(browserTimeZone());
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://trakometer.mypcp.us/images/logotrakometer.png"
        alt="Trakometer"
        className="h-6 w-auto shrink-0"
      />

      <nav className="hidden items-center gap-1 rounded-lg bg-muted p-1 sm:flex">
        <Link
          href={base || "/"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            !isChats && "bg-background text-foreground shadow-sm"
          )}
        >
          <Gauge className="size-4" />
          Overview
        </Link>
        <Link
          href={`${base}/chats`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            isChats && "bg-background text-foreground shadow-sm"
          )}
        >
          <MessagesSquare className="size-4" />
          Chat portal
        </Link>
      </nav>

      <div className="flex-1" />

      <div className="hidden items-center gap-1 rounded-lg border p-1 md:flex">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
              range === r && "bg-primary text-primary-foreground hover:text-primary-foreground"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <form
        className="relative hidden items-center lg:flex"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
        }}
      >
        <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search account / dealership"
          className="h-8 w-56 pl-8 pr-8"
        />
        {q && (
          <button
            type="button"
            title="Clear"
            onClick={() => {
              setQ("");
              setSearch("");
            }}
            className="absolute right-16 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
        <Button type="submit" size="sm" className="ml-1.5 h-8">
          Go
        </Button>
      </form>

      <div
        title="Browser timezone"
        className="hidden items-center gap-1 text-xs text-muted-foreground xl:flex"
      >
        <Globe className="size-3.5" />
        {tz}
      </div>

      {isChats && (
        <div className="hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 sm:flex">
          <span className={cn("text-xs font-medium", online ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground")}>
            {online ? "Online" : "Offline"}
          </span>
          <Switch checked={online} onCheckedChange={setOnline} aria-label="Toggle online status" />
        </div>
      )}

      <ThemeToggle />

      <Button variant="ghost" size="icon" title="Sign out" onClick={logout}>
        <LogOut />
      </Button>
    </header>
  );
}
