"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CHANNELS } from "@/lib/trakometer/data";
import type { RangeKey } from "@/lib/trakometer/types";
import { browserTimeZone } from "@/lib/trakometer/utils";
import { cn } from "@/lib/utils";
import {
  Gauge,
  Globe,
  LogOut,
  MessagesSquare,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePortal } from "./portal-provider";

const RANGES: RangeKey[] = ["ITD", "YTD", "MTD", "30"];

export default function TopBar() {
  const pathname = usePathname() ?? "/";
  const isEmbedded = pathname.startsWith("/test");
  const localPath = isEmbedded
    ? pathname.replace(/^\/test/, "") || "/"
    : pathname;
  // Any chat channel (/nguage, /trade, …) counts as the chat portal.
  const isChats = CHANNELS.some((c) => localPath.startsWith(c.link));
  const base = isEmbedded ? "/test" : "";

  const { range, setRange, search, applySearch, online, setOnline, logout } =
    usePortal();
  const [q, setQ] = useState(search);
  const [tz, setTz] = useState("");
  // Below `lg` the filters live in a panel under the header instead of in it.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    // Client-only value (differs per browser) — must run post-hydration to avoid a server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTz(browserTimeZone());
  }, []);

  const navLinks = (className: string) => (
    <nav
      className={cn("items-center gap-1 rounded-lg bg-muted p-1", className)}
    >
      <Link
        href={base || "/"}
        onClick={() => setMenuOpen(false)}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          !isChats && "bg-background text-foreground shadow-sm",
        )}
      >
        <Gauge className="size-4" />
        Dashboard
      </Link>
      <Link
        href={`${base}${CHANNELS[0].link}`}
        onClick={() => setMenuOpen(false)}
        className={cn(
          "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground text-nowrap",
          isChats && "bg-background text-foreground shadow-sm",
        )}
      >
        <MessagesSquare className="size-4" />
        Chat portal
      </Link>
    </nav>
  );

  const rangeButtons = (className: string) => (
    <div className={cn("items-center gap-1 rounded-lg border p-1", className)}>
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => {
            setRange(r);
            // Apply whatever is typed in the search box too, so one click sends both.
            if (q !== search) applySearch(q);
          }}
          className={cn(
            "flex-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground text-nowrap",
            range === r &&
              "bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          {r === "30" ? "30 DAY" : r}
        </button>
      ))}
    </div>
  );

  const searchForm = (className: string, inputClass: string) => (
    <form
      className={cn("relative items-center", className)}
      onSubmit={(e) => {
        e.preventDefault();
        applySearch(q);
        setMenuOpen(false);
      }}
    >
      <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search account / dealership"
        className={cn("h-8 pl-8 pr-8", inputClass)}
      />
      {q && (
        <button
          type="button"
          title="Clear"
          onClick={() => {
            setQ("");
            applySearch("");
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
  );

  const onlineSwitch = (className: string) => (
    <div
      className={cn(
        "items-center gap-2 rounded-lg border px-2.5 py-1.5 ",
        className,
      )}
    >
      <span
        className={cn(
          "text-xs font-medium",
          online ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground",
        )}
      >
        {online ? "Online" : "Offline"}
      </span>
      <Switch
        className={"cursor-pointer duration-1000 ease-in-out"}
        checked={online}
        onCheckedChange={setOnline}
        aria-label="Toggle online status"
      />
    </div>
  );

  return (
    <div className="sticky top-0 z-40 shrink-0 bg-background">
      <header className="flex h-14 items-center gap-2 border-b px-3 sm:gap-3 sm:px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://trakometer.mypcp.us/images/logotrakometer.png"
          alt="Trakometer"
          className="h-6 w-auto shrink-0"
        />

        {navLinks("hidden sm:flex")}

        <div className="flex-1" />

        {rangeButtons("hidden md:flex")}
        {searchForm("hidden lg:flex", "w-56")}

        <div
          title="Browser timezone"
          className="hidden items-center gap-1 text-xs text-muted-foreground xl:flex"
        >
          <Globe className="size-3.5" />
          {tz}
        </div>

        {isChats && onlineSwitch("hidden sm:flex")}

        <Button
          variant={menuOpen ? "secondary" : "ghost"}
          size="icon"
          title="Filters & menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="lg:hidden"
        >
          <SlidersHorizontal />
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="icon" title="Sign out" onClick={logout}>
          <LogOut />
        </Button>
      </header>

      {/* Whatever the header has no room for at this width. */}
      {menuOpen && (
        <div className="flex flex-col gap-3 border-b px-3 py-3 sm:px-4 lg:hidden">
          {navLinks("flex sm:hidden")}
          {rangeButtons("flex md:hidden")}
          {searchForm("flex", "min-w-0 flex-1")}
          {isChats && onlineSwitch("flex justify-between sm:hidden")}
          {tz && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="size-3.5" />
              {tz}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
