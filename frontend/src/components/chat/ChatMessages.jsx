import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function ChatMessages({ chat, onSendMessage }) {
  const currentUser = useSelector((state) => state.auth.user);
  const messageRef = useRef();
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = messageRef.current.value.trim();
    if (message) {
      onSendMessage(message);
      messageRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-medium text-gray-900">
          {chat.participants
            .filter(p => p._id !== currentUser._id)
            .map(p => p.name)
            .join(', ')}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {chat.messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.sender._id === currentUser._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-sm ${
                  message.sender._id === currentUser._id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            ref={messageRef}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 