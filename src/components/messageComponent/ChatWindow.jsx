import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = ({ activeConversation }) => {
  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center text-white/35">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div
      data-lenis-prevent
      className="flex h-full min-h-0 flex-col overflow-hidden"
    >
      <ChatHeader conversation={activeConversation} />
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatWindow;