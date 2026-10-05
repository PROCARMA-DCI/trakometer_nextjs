import ChatScreen from "@/components/trakometer/chat/chat-screen";

export const metadata = {
  title: "Chat portal | Trakometer",
};

export default function Page() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4">
      <ChatScreen />
    </div>
  );
}
