import { PortalProvider } from "@/components/trakometer/portal-provider";
import TopBar from "@/components/trakometer/top-bar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-muted/30">
        <TopBar />
        {/* overflow-auto (not hidden): pages that don't own a scroller (tables,
            forms) scroll here automatically. Chat/overview screens use
            `min-h-0 flex-1` + their own scrollers, so they shrink to fit and
            never trigger this one. */}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </PortalProvider>
  );
}
