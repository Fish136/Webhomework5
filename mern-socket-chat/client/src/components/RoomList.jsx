export default function RoomList({ rooms, active, onJoin }) {
  return (
    <div className="card">
      <h3>Rooms</h3>
      <ul className="list">
        {rooms.map(r => (
          <li key={r} className={`room ${active === r ? "active" : ""}`} onClick={()=>onJoin(r)}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
