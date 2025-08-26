export default function MessageList({ messages, me, typingUsers }) {
  return (
    <div className="card" style={{ height: 420, overflowY: "auto" }}>
      {messages.map(m => (
        <div key={m.id} className={`msg ${m.sender.id === me?.id ? "me" : ""}`}>
          <div className="msg-bubble">
            <b>@{m.sender.username}</b> <small>{new Date(m.timestamp).toLocaleTimeString()}</small>
            <div>{m.content}</div>
          </div>
        </div>
      ))}
      {typingUsers.length > 0 && (
        <div className="typing">{typingUsers.length === 1 ? "Someone is typing..." : "Several people are typing..."}</div>
      )}
    </div>
  );
}
