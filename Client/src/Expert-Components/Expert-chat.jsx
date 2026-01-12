import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, User } from "lucide-react";
import { useSocket } from "../utils/SocketContext";
import "../styles/Chat.css";

const ExpertChat = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const expertContact = localStorage.getItem("expertContact");
  const expertId = localStorage.getItem("expertId");
  const messagesEndRef = useRef(null);

  const { socket, connected } = useSocket();

  const roomId = clientId < expertId
    ? `${clientId}-${expertId}`
    : `${expertId}-${clientId}`;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("join-room", roomId);
    console.log(`💬 Expert joined chat room: ${roomId}`);

    const handleReceiveMessage = (data) => {
      console.log("Message received:", data);
      setMessages((prev) => [...prev, data]);
    };

    const handleUserTyping = ({ sender }) => {
      if (sender !== expertContact) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ sender }) => {
      if (sender !== expertContact) {
        setIsTyping(false);
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [socket, connected, roomId, expertContact]);

  const sendMessage = () => {
    if (!message.trim() || !connected) return;

    const messageData = {
      roomId,
      message: message.trim(),
      sender: expertContact
    };

    socket.emit("send-message", messageData);
    socket.emit("stop-typing", { roomId, sender: expertContact });
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
    
    if (!connected) return;
    
    if (e.target.value.trim()) {
      socket.emit("typing", { roomId, sender: expertContact });
    } else {
      socket.emit("stop-typing", { roomId, sender: expertContact });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3>
            <User size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Chat with Client
          </h3>
          {connected ? (
            <span className="status-online">● Online</span>
          ) : (
            <span className="status-offline">● Connecting...</span>
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
              className={msg.sender === expertContact ? "message-container my-message-container" : "message-container their-message-container"}
            >
              <div className={msg.sender === expertContact ? "my-message" : "their-message"}>
                <div className="message-sender">
                  {msg.sender === expertContact ? "You" : "Client"}
                </div>
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

export default ExpertChat;