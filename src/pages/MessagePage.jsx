import React, { useEffect } from "react";
import ConversationSidebar from "../components/messageComponent/ConversationSidebar";
import ChatWindow from "../components/messageComponent/ChatWindow";
import { useMessageStore } from "../store/messageStore";
import useChatInit from "../hooks/useChatInit";

const MessagePage = () => {
  useChatInit();

  const { activeConversation } = useMessageStore();

  useEffect(() => {
    let lenis = window.__lenis;

    const stopLenis = () => {
      lenis = window.__lenis;
      if (lenis?.stop) {
        lenis.stop();
      }
    };

    stopLenis();

    const intervalId = window.setInterval(() => {
      stopLenis();
    }, 100);

    return () => {
      window.clearInterval(intervalId);
      if (lenis?.start) {
        lenis.start();
      }
    };
  }, []);

  return (
    <div
      data-lenis-prevent
      className="h-[calc(100vh-80px)] w-full overflow-hidden"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      <div className="mx-auto grid h-full min-h-0 max-w-7xl grid-cols-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="col-span-4 h-full overflow-hidden border-r border-white/10">
          <ConversationSidebar />
        </div>

        <div className="col-span-8 h-full overflow-hidden">
          <ChatWindow activeConversation={activeConversation} />
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
