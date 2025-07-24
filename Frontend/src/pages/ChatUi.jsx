import React, { useState, useRef, useEffect } from "react";
import { socket } from "../Socket.js";
import { useLocation } from "react-router-dom";

const ChatPage = () => {
  const location = useLocation();
  const targetUserId = location.state?.id;

  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const messagesEndRef = useRef(null);

  // ✅ Get consistent room ID once both IDs are available
  const roomId =
    currentUserId && targetUserId
      ? [currentUserId, targetUserId].sort().join("-")
      : null;

  useEffect(() => {
    const updateIsRead = async () => {
      if (!roomId || !currentUserId) return;

      try {
        const res = await fetch(
          "https://service-provider-website.onrender.com/api/v1/auth/markAsRead",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, userId: currentUserId }),
          }
        );

        const data = await res.json();
        if (!data.success) {
          console.error("Failed to mark messages as read:", data.message);
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    updateIsRead();
  }, [roomId, currentUserId]);

  // ✅ Fetch current user from backend
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(
          "https://service-provider-website.onrender.com/api/v1/auth/getCurrentUser",
          {
            credentials: "include", // needed to send cookies
          }
        );
        const data = await res.json();
        console.log(data)
        if (data.success) {
          setCurrentUserId(data.user.id);
        } else {
          console.error("Failed to fetch current user");
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // ✅ Fetch receiver user info
  useEffect(() => {
    if (!targetUserId) return;

    const fetchUserDetails = async () => {
      try {
        const res = await fetch(
          `https://service-provider-website.onrender.com/api/v1/auth/getUserDetails/${targetUserId}`
        );
        const data = await res.json();
        if (data.success) {
          setUserDetails(data.user);
        } else {
          console.error("User fetch failed:", data.message);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, [targetUserId]);

  // ✅ Fetch old chat history
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `https://service-provider-website.onrender.com/api/v1/auth/getChatHistory/${roomId}`
        );
        const data = await res.json();
        if (data.success) {
          const formatted = data.messages.map((msg) => ({
            id: msg._id,
            content: msg.message,
            sender: msg.senderId === currentUserId ? "me" : "user",
            timestamp: new Date(msg.createdAt),
          }));
          setMessages(formatted);
        } else {
          console.error("Failed to load chat history");
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    fetchMessages();
  }, [roomId, currentUserId]);

  // ✅ Socket join and listener
  useEffect(() => {
    if (!currentUserId || !targetUserId) return;

    socket.emit("join", currentUserId);

    socket.on("receive-message", (data) => {
      if (data.senderId === targetUserId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: data.message,
            sender: "user",
            timestamp: new Date(),
          },
        ]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [currentUserId, targetUserId]);

  // ✅ Send message via socket
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (!currentUserId || !targetUserId) {
      console.log(currentUserId, targetUserId)
      console.warn("Missing sender or receiver ID");
      return;
    }

    console.log("Message sending...");

    const newMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "me",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("send-message", {
      senderId: currentUserId,
      receiverId: targetUserId,
      message: inputValue,
    });

    setInputValue("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderAvatar = (sender) => {
    const initials =
      sender === "me" ? "Me" : userDetails?.name?.[0]?.toUpperCase() || "U";
    const bg = sender === "me" ? "bg-purple-500" : "bg-blue-500";
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
        {userDetails?.avatar ? (
          <img
            src={userDetails.avatar}
            alt="User"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            {userDetails?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {userDetails?.name || "Loading..."}
          </h2>
          <p className="text-sm text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender !== "me" && renderAvatar("user")}
            <div
              className={`max-w-xs sm:max-w-md p-3 rounded-lg text-sm shadow ${
                msg.sender === "me"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white ml-auto"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formatTime(msg.timestamp)}
              </p>
            </div>
            {msg.sender === "me" && renderAvatar("me")}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
            disabled={!inputValue.trim()}
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
