import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import RoomList from "../components/RoomList";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import PresenceBar from "../components/PresenceBar";
import api from "../api";
import { createSocket } from "../hooks/useSocket";

const DEFAULT_ROOMS = ["general","funny"];

export default function Chat() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("token");
  const socket = useMemo(() => (token ? createSocket(token) : null), [token]);
  const socketRef = useRef(socket);

  const [activeRoom, setActiveRoom] = useState(DEFAULT_ROOMS[0]);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Socket setup
  useEffect(() => {
    if (!socket) return;

    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));
    socket.on("message:new", (msg) => {
      // Use the functional form of setState to get the latest activeRoom
      setActiveRoom(currentRoom => {
        if (msg.room === currentRoom) {
          setMessages(m => [...m, msg]);
        }
        return currentRoom;
      });
    });
    socket.on("typing:update", (userIds) => {
      setTypingUsers(userIds.filter(id => id !== user?.id));
    });
    socket.on("presence:update", (list) => setOnline(list));

    
    socket.emit("room:join", activeRoom);
    fetchHistory(activeRoom);

    
    return () => {
      socket.emit("room:leave", activeRoom);
      
      
      socket.off("connect");
      socket.off("connect_error");
      socket.off("message:new");
      socket.off("typing:update");
      socket.off("presence:update");

     
    };
  }, [socket, activeRoom, user?.id]);

  async function fetchHistory(room) {
    try {
      const res = await api.get(`/messages/${room}?limit=50`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch message history:", error);
      setMessages([]); 
    }
  }

  async function changeRoom(room) {
    if (!socket || room === activeRoom) return;


    setActiveRoom(room);
    setMessages([]);
    setTypingUsers([]);
  }

  function send(text) {
    if (!socket || !text.trim()) return;
    socket.emit("message:send", { room: activeRoom, content: text }, (ack) => {
      if (!ack?.ok) {
        console.error("Failed to send message:", ack?.error);
        alert(ack?.error || "Failed to send message");
      }
    });
  }

  function typing(on) {
    if (!socket) return;
    socket.emit("typing", { room: activeRoom, isTyping: on });
  }

  return (
    <div className="container">
      <div className="header">
        <h2>💬 MERN Socket Chat</h2>
        <div>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="row">
        <div className="col" style={{ maxWidth: 260 }}>
          <RoomList rooms={DEFAULT_ROOMS} active={activeRoom} onJoin={changeRoom} />
          <PresenceBar online={online} me={user} />
        </div>

        <div className="col">
          <MessageList messages={messages} me={user} typingUsers={typingUsers} />
          <MessageInput onSend={send} onTyping={typing} />
        </div>
      </div>
    </div>
  );
}