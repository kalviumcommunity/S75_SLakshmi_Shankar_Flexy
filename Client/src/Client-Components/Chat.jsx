import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Cookie from 'js-cookie';

const socket = io('https://flexy-backend.onrender.com');

const ChatRoom = () => {
    const { expertId } = useParams();
    const clientId = Cookie.get('id');
    const userName = Cookie.get('name');
    const roomId = `${clientId}-${expertId}`;

    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);

    useEffect(() => {
        socket.emit('join_room', roomId);
        console.log(expertId)

        // Load previous messages
        fetch(`https://flexy-backend.onrender.com/api/chat/${clientId}/${expertId}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setChatLog(data.messages);
                }
            });

        socket.on('receive_message', (data) => {
            setChatLog((prev) => [...prev, {
                sender: 'expert',
                message: data.message,
                timestamp: new Date()
            }]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [roomId, clientId, expertId]);

    const handleSendMessage = async () => {
        if (message.trim() === '') return;

        const msgData = {
            room: roomId,
            message
        };

        socket.emit('send_message', msgData);

        const newMessage = {
            client: clientId,
            expert: expertId,
            sender: 'client',
            message
        };

        // Save to DB
        await fetch('https://flexy-backend.onrender.com/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(newMessage)
        });

        setChatLog((prev) => [...prev, {
            sender: 'client',
            message,
            timestamp: new Date()
        }]);

        setMessage('');
    };

    return (
        <div className="chat-room-container">
            <h2>Chat with Expert</h2>
            <div className="chat-log">
                {chatLog.map((msg, idx) => (
                    <div key={idx} className={msg.sender === 'client' ? 'client-msg' : 'expert-msg'}>
                        <strong>{msg.sender === 'client' ? userName : 'Expert'}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;
