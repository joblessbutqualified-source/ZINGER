import { DirectMessages } from "@/components/chat/direct-messages";

export default function ChatPage() {
  return (
    <div className="-mx-4 -my-8 h-[calc(100dvh-4rem)] sm:-mx-8 lg:h-screen">
      <DirectMessages />
    </div>
  );
}
