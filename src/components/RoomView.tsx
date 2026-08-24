import { useGameStore } from "../game/store";

export function RoomView() {
  const room = useGameStore((s) => s.currentRoom);
  if (!room) return null;

  return (
    <div className="td-panel" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.7, fontSize: "0.75rem" }}>
        <span>depth {room.depth}</span>
        <span>{room.type.toUpperCase()}</span>
      </div>
      <h2 className="td-glow" style={{ margin: "0.25rem 0", color: "var(--td-green)" }}>
        {room.title}
      </h2>
      <pre className="td-ascii">{room.ascii}</pre>
      <p style={{ color: "var(--td-fg)" }}>{room.flavor}</p>
    </div>
  );
}
