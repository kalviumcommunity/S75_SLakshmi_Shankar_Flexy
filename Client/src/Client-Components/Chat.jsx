import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Cookie from "js-cookie";
import "../styles/Chat.css";

const socket = io("https://flexy-backend.onrender.com", {
  withCredentials: true
});

const Chat = () => {
  const { expertId } = useParams();
  const clientId = Cookie.get("id");
  const userName = Cookie.get("name");

  const roomId =
    clientId < expertId
      ? `${clientId}-${expertId}`
      : `${expertId}-${clientId}`;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId,
      message,
      sender: userName
    });

    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.sender === userName ? "my-message" : "their-message"
            }
          >
            <strong>{msg.sender}</strong>
            <p>{msg.message}</p>
            <span>{msg.time}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
