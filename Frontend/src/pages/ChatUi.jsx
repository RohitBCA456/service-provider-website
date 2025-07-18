import React, { useState, useRef, useEffect } from "react";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "Hey there! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      content: "Hi! I'd like to know more about your capabilities.",
      sender: "user",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      content:
        "I can assist with writing, questions, explanations, and more. What would you like to explore?",
      sender: "bot",
      timestamp: new Date(Date.now() - 180000),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! I'll get back to you shortly.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderAvatar = (sender) => {
    const initials = sender === "user" ? "U" : "A";
    const bg = sender === "user" ? "bg-purple-500" : "bg-blue-500";
    return (
      <div
        className={`h-8 w-8 rounded-full ${bg} text-white flex items-center justify-center font-bold`}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm px-4 py-3 border-b flex items-center gap-3 z-10">
        <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          A
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
          <p className="text-sm text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            Online
          </p>
        </div>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && renderAvatar("bot")}
            <div
              className={`max-w-xs sm:max-w-md p-3 rounded-lg text-sm shadow ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white ml-auto"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formatTime(msg.timestamp)}
              </p>
            </div>
            {msg.sender === "user" && renderAvatar("user")}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            {renderAvatar("bot")}
            <div className="bg-white border px-3 py-2 rounded-lg shadow flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Input Area */}
      <div className="sticky bottom-0 bg-white border-t p-4 z-10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2 text-gray-700 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
