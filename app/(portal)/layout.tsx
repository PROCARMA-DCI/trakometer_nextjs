import { PortalProvider } from "@/components/trakometer/portal-provider";
import TopBar from "@/components/trakometer/top-bar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-muted/30">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </PortalProvider>
  );
}
