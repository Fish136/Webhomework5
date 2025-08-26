export default function PresenceBar({ online, me }) {
  return (
    <div className="card">
      <div className="header">
        <h3>Online</h3>
        <div>Signed in as <b>@{me?.username}</b></div>
      </div>
      <div className="presence">
        {online.map(u => (
          <span key={u.id} className="pill">@{u.username}</span>
        ))}
      </div>
    </div>
  );
}
