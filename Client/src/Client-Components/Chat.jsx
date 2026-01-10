import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Send, ArrowLeft } from "lucide-react";
import "../styles/Chat.css";

// Initialize socket connection
const socket = io("https://flexy-backend.onrender.com", {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

const Chat = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const clientPhone = localStorage.getItem("clientPhone") || "Guest";
  const messagesEndRef = useRef(null);

  // Create room ID (consistent ordering)
  const roomId = clientPhone < expertId
    ? `${clientPhone}-${expertId}`
    : `${expertId}-${clientPhone}`;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connection listeners
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    // Join room
    socket.emit("join-room", roomId);

    // Listen for messages
    socket.on("receive-message", (data) => {
      console.log("Message received:", data);
      setMessages((prev) => [...prev, data]);
    });

    // Listen for typing indicators
    socket.on("user-typing", ({ sender }) => {
      if (sender !== clientPhone) {
        setIsTyping(true);
      }
    });

    socket.on("user-stop-typing", ({ sender }) => {
      if (sender !== clientPhone) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [roomId, clientPhone]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const messageData = {
      roomId,
      message: message.trim(),
      sender: clientPhone
    };

    socket.emit("send-message", messageData);
    socket.emit("stop-typing", { roomId, sender: clientPhone });
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (e.target.value.trim()) {
      socket.emit("typing", { roomId, sender: clientPhone });
    } else {
      socket.emit("stop-typing", { roomId, sender: clientPhone });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3>Expert Chat</h3>
          {connected ? (
            <span className="status-online">Online</span>
          ) : (
            <span className="status-offline">Connecting...</span>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.sender === clientPhone ? "message-container my-message-container" : "message-container their-message-container"}
            >
              <div className={msg.sender === clientPhone ? "my-message" : "their-message"}>
                <div className="message-sender">{msg.sender}</div>
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {new Date(msg.time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={!connected}
        />
        <button onClick={sendMessage} disabled={!message.trim() || !connected}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
