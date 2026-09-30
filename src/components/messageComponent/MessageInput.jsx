import React ,{ useEffect } from "react";
import { useSelector } from "react-redux";
import { useMessageStore } from "../../store/messageStore";
import { getUserId } from "../../utils/messageUtils";
import { motion } from "framer-motion";

const MessageInput = () => {
  const { sendMessage, activeConversation } = useMessageStore();
  const user = useSelector((state) => state.user.user);
  const currentUserId = getUserId(user);
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef(null);

  const isPending = activeConversation?.status === "pending";
  const isInitiator =
    activeConversation?.initiatedBy?.toString?.() === currentUserId?.toString?.();
  const isDisabled = !activeConversation || (isPending && !isInitiator);

  const handleSend = () => {
    if (!text.trim() || isDisabled) return;
    sendMessage(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  useEffect(() => {
        // Load Lord Icon from CDN
        const script = document.createElement('script')
        script.src = 'https://cdn.lordicon.com/lordicon.js'
        document.body.appendChild(script)
      }, [])


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (event) => {
    setText(event.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  return (
    <div className="sticky bottom-0 z-10 border-t border-white/10 bg-/95 px-4 py-3 flex-shrink-0 backdrop-blur-sm">
      {isDisabled && (
        <div className="mb-2 text-xs text-white/45">
          {activeConversation
            ? "You can reply once the request is accepted."
            : "Select a conversation to start chatting."}
        </div>
      )}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={isDisabled}
          className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed"
        />

        <motion.button
          whileClick={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!text.trim() || isDisabled}
          className=""
        >
          <lord-icon
    src="https://cdn.lordicon.com/kxnplube.json"
    trigger="hover"
    
    colors="primary:#ffffff,secondary:#ffffff"
    style={{ width: "40px", height: "40px" }}>
</lord-icon>
        </motion.button>
      </div>
    </div>
  );
};

export default MessageInput;