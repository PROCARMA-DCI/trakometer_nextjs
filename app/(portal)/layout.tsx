import { PortalProvider } from "@/components/trakometer/portal-provider";
import TopBar from "@/components/trakometer/top-bar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <div className="flex h-full min-h-screen flex-col bg-muted/30">
        <TopBar />
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </PortalProvider>
  );
}
