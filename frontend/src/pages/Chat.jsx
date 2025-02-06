import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChats,
  sendMessage,
  addMessageToChat,
  deleteChat,
  setActiveChat,
} from "../store/slices/chatSlice";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import NewChatModal from "../components/chat/NewChatModal";
import { supabase } from "../utils/supabase";
import axios from "axios";

export default function Chat() {
  const dispatch = useDispatch();
  const { chats, activeChat, loading, error } = useSelector((state) => state.chat);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const otherUser = useSelector((state) => state.auth.otherUser);

  // Store active chat ID in local storage
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChatId', activeChat._id);
    }
  }, [activeChat]);

  // Restore active chat on component mount
  useEffect(() => {
    const activeChatId = localStorage.getItem('activeChatId');
    if (activeChatId && chats.length > 0) {
      const savedChat = chats.find(chat => chat._id === activeChatId);
      if (savedChat) {
        dispatch(setActiveChat(savedChat));
      }
    }
  }, [chats, dispatch]);

  // Fetch chats on component mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchChats());
    }
  }, [dispatch, currentUser]);

  // Periodically refresh chats to ensure consistency
  useEffect(() => {
    if (!currentUser?.id) return;

    const refreshInterval = setInterval(() => {
      dispatch(fetchChats());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [dispatch, currentUser]);

  // Subscribe to new chats
  useEffect(() => {
    if (!currentUser?.id) return;

    const subscription = supabase
      .channel('public:chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `participants=cs.{${currentUser.id}}`,
        },
        (payload) => {
          dispatch(fetchChats());
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, dispatch]);

  // Subscribe to chat member changes
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel('chat-members')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'api',
          table: 'chat_members',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          // Refresh chats when member changes occur
          dispatch(fetchChats());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, dispatch]);

  // Subscribe to active chat messages
  useEffect(() => {
    if (!activeChat?._id || !currentUser?.id) return;

    const channel = supabase
      .channel(`chat-${activeChat._id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'api',
          table: 'messages',
          filter: `chat_id=eq.${activeChat._id}`
        },
        async (payload) => {
          // Get sender details from the cache or fetch them
          let sender = chats
            .find(c => c._id === activeChat._id)
            ?.participants
            .find(p => p._id === payload.new.sender_id);

          if (!sender) {
            try {
              const response = await axios.get(`/users/${payload.new.sender_id}`);
              sender = response.data;
            } catch (error) {
              console.error('Error fetching message sender:', error);
              sender = { name: 'Unknown User' };
            }
          }

          dispatch(addMessageToChat({
            chatId: activeChat._id,
            message: {
              _id: payload.new.id,
              content: payload.new.content,
              sender: {
                _id: payload.new.sender_id,
                name: sender.name
              },
              createdAt: payload.new.created_at,
              readBy: payload.new.read_by || []
            }
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat?._id, currentUser?.id, dispatch, chats]);

  const handleSendMessage = useCallback(
    async (message) => {
      if (!activeChat) return;

      try {
        console.log("Sending message:", message, "Current user:", currentUser);
        
        // Send to backend first and wait for response
        const result = await dispatch(
          sendMessage({
            chatId: activeChat._id,
            content: message,
          })
        ).unwrap();

        // Don't add message to UI here since it will come through the subscription
        console.log("Message sent successfully");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [activeChat, currentUser, dispatch]
  );

  const handleDeleteChat = useCallback(
    async (chatId) => {
      try {
        await dispatch(deleteChat(chatId)).unwrap();
        if (activeChat?._id === chatId) {
          dispatch(setActiveChat(null));
        }
      } catch (error) {
        console.error("Failed to delete chat:", error);
      }
    },
    [dispatch, activeChat]
  );

  const handleChatSelect = useCallback(
    (chat) => {
      dispatch(setActiveChat(chat));
    },
    [dispatch]
  );

  return (
    <div className="h-screen flex bg-white">
      {/* Left Column: Chat List */}
      <div className="w-[350px] border-r border-gray-200 flex flex-col">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          loading={loading}
          error={error}
          onNewChat={() => setIsNewChatModalOpen(true)}
          onDeleteChat={handleDeleteChat}
          onChatSelect={handleChatSelect}
        />
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          chat={activeChat}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <NewChatModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
        />
      )}
    </div>
  );
}
