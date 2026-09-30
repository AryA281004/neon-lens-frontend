import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useMessageStore } from "../store/messageStore";
import { connectSocket, disconnectSocket } from "../utils/socket";

const useChatInit = () => {
  const {
    fetchConversations,
    initSocketListeners,
    cleanupSocketListeners,
    setCurrentUserId,
  } = useMessageStore();

  const user = useSelector((state) => state.user.user);
  const currentUserId = user?._id || user?.id || null;

  useEffect(() => {
    if (currentUserId) {
      setCurrentUserId(currentUserId);
    }
  }, [currentUserId, setCurrentUserId]);

  useEffect(() => {
    connectSocket();
    initSocketListeners();
    fetchConversations();

    return () => {
      cleanupSocketListeners();
      disconnectSocket();
    };
  }, [fetchConversations, initSocketListeners, cleanupSocketListeners]);
};

export default useChatInit;