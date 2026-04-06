import React, { useState, useRef, useEffect, useCallback } from "react";
import { socket } from "../Socket.js";
import { useLocation, useNavigate } from "react-router-dom";

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const targetUserId = location.state?.id;

  // States
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  
  // Pagination & Loading States
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Consistent Room ID: Sorted IDs ensure both users hit the same Redis Key
  const roomId = currentUserId && targetUserId 
    ? [currentUserId, targetUserId].sort().join("-") 
    : null;

  // 1. Fetch Chat History (Supports Cursor Pagination)
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!roomId || isLoading || (!hasMore && !isInitial)) return;

    setIsLoading(true);
    try {
      // If no cursor is passed, Backend hits Redis (Upstash) for Page 1
      const queryCursor = !isInitial && cursor ? `&cursor=${cursor}` : "";
      const res = await fetch(
        `http://localhost:5000/api/v1/auth/getChatHistory/${roomId}?limit=20${queryCursor}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data.success) { 
        const formatted = data.messages.map((msg) => ({
          id: msg._id,
          content: msg.message,
          sender: msg.senderId === currentUserId ? "me" : "user",
          timestamp: new Date(msg.createdAt),
        }));

        if (isInitial) {
          setMessages(formatted);
          setIsInitialLoad(false);
        } else {
          // Prepend older messages to the top
          const scrollContainer = chatContainerRef.current;
          const previousScrollHeight = scrollContainer.scrollHeight;

          setMessages((prev) => [...formatted, ...prev]);

          // Adjust scroll so user stays at the same message position
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight - previousScrollHeight;
          }, 0);
        }

        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, cursor, isLoading, hasMore, currentUserId]);

  // 2. Fetch Users & Initial Data
  useEffect(() => {
    const initChat = async () => {
      // Fetch Current User
      try {
        const res = await fetch("http://localhost:5000/api/v1/auth/getCurrentUser", { credentials: "include" });
        const data = await res.json();
        if (data.success) setCurrentUserId(data.user._id);
        else navigate("/login");
      } catch (err) { console.error(err); }

      // Fetch Receiver Details
      if (targetUserId) {
        try {
          const res = await fetch(`http://localhost:5000/api/v1/auth/getUserDetails/${targetUserId}`);
          const data = await res.json();
          if (data.success) setUserDetails(data.user);
        } catch (err) { console.error(err); }
      }
    };
    initChat();
  }, [targetUserId, navigate]);

  // 3. Trigger Initial Message Fetch
  useEffect(() => {
    if (roomId && currentUserId) {
      fetchMessages(true);
    }
  }, [roomId, currentUserId]); // Runs only when roomId is ready

  // 4. Socket Listeners
  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("join", currentUserId);

    socket.on("receive-message", (data) => {
      // Only add to UI if message belongs to THIS room
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.message,
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      scrollToBottom();
    });

    return () => socket.off("receive-message");
  }, [currentUserId]);

  // 5. Scroll & Input Handlers
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !isLoading) {
      fetchMessages(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentUserId || !targetUserId) return;

    const messagePayload = {
      senderId: currentUserId,
      receiverId: targetUserId,
      message: inputValue,
      roomId, // Sent to backend to trigger Redis cache deletion
    };

    // Optimistic Update: Show locally immediately
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: inputValue,
        sender: "me",
        timestamp: new Date(),
      },
    ]);

    socket.emit("send-message", messagePayload);
    setInputValue("");
    scrollToBottom();
  };

  // 6. UI Helpers
  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
          {userDetails?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h2 className="font-bold text-gray-800">{userDetails?.name || "Loading..."}</h2>
          <span className="text-xs text-green-500 font-medium">● Online</span>
        </div>
      </header>

      {/* Messages Area */}
      <main 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading && (
          <div className="text-center py-2">
            <span className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-500">Loading history...</span>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm ${
              msg.sender === "me" 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-white text-gray-800 border rounded-tl-none"
            }`}>
              <p>{msg.content}</p>
              <span className={`text-[10px] block mt-1 ${msg.sender === "me" ? "text-indigo-100" : "text-gray-400"}`}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            className="flex-1 bg-gray-100 text-black border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;