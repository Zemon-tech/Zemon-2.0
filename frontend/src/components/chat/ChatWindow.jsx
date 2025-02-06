import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  UsersIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function ChatWindow({ chat, onSendMessage }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, scrollToBottom]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        await onSendMessage(message.trim());
        setMessage("");
        setShowEmojiPicker(false);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const getMessageSenderName = (msg) => {
    if (!chat?.isGroupChat || !msg?.sender) return '';
    return msg.sender._id === currentUser?.id ? 'You' : msg.sender.name || 'Unknown User';
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {chat?.type === 'group' ? (
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                <span className="text-sm font-medium text-white">
                  {chat?.participants?.find(p => p?._id !== currentUser?.id)?.name?.charAt(0) || '?'}
                </span>
              </span>
            )}
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900">
                {chat?.type === 'group' 
                  ? chat.name
                  : chat?.participants?.find(p => p?._id !== currentUser?.id)?.name || 'Unknown User'}
              </h2>
              {chat?.type === 'group' && (
                <p className="text-sm text-gray-500">
                  {chat?.participants?.length || 0} members
                </p>
              )}
            </div>
          </div>
          {chat?.type === 'group' && (
            <button
              onClick={() => setShowGroupInfo(!showGroupInfo)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <InformationCircleIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {chat?.messages?.map((msg, index) => {
          const isSentByMe = msg?.sender?._id === currentUser?.id;
          const messageAlignment = isSentByMe ? "justify-end" : "justify-start";
          const messageColor = isSentByMe ? "bg-indigo-600 text-white" : "bg-white text-gray-900";

          return (
            <div key={msg?._id || `msg-${index}`} className={`flex ${messageAlignment}`}>
              <div className={`rounded-lg px-4 py-2 max-w-[70%] shadow-sm ${messageColor}`}>
                {chat?.type === 'group' && !isSentByMe && (
                  <p className="text-xs font-medium mb-1 text-gray-500">
                    {msg?.sender?.name || 'Unknown User'}
                  </p>
                )}
                <p className="text-sm">{msg?.content}</p>
                <div className="flex items-center justify-end mt-1">
                  <span className="text-xs opacity-75">
                    {format(new Date(msg?.createdAt || Date.now()), 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Group Info Sidebar */}
      {showGroupInfo && chat?.type === 'group' && (
        <div className="w-64 border-l border-gray-200 bg-white p-4">
          <h3 className="font-medium text-gray-900 mb-4">Group Members</h3>
          <div className="space-y-2">
            {chat?.participants?.map(participant => (
              <div key={participant._id} className="flex items-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                  <span className="text-sm font-medium text-white">
                    {participant.name?.charAt(0)}
                  </span>
                </span>
                <span className="ml-2 text-sm text-gray-700">
                  {participant.name}
                  {participant._id === chat.admin?._id && (
                    <span className="ml-1 text-xs text-gray-500">(Admin)</span>
                  )}
                  {participant._id === currentUser?.id && (
                    <span className="ml-1 text-xs text-gray-500">(You)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-600"
          >
            <FaceSmileIcon className="h-6 w-6" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-20">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
          </button>
        </form>
      </div>
    </div>
  );
}
