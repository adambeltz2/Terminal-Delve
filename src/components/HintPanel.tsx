import { useState } from "react";
import { useGameStore } from "../game/store";

export function HintPanel() {
  const room = useGameStore((s) => s.currentRoom);
  const [open, setOpen] = useState(false);
  if (!room) return null;

  return (
    <div className="td-panel" style={{ padding: "0.75rem 1rem" }}>
      <button className="td-btn" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }} onClick={() => setOpen((v) => !v)}>
        {open ? "hide hint" : "show hint"}
      </button>
      {open && (
        <pre
          className="td-ascii"
          style={{ marginTop: "0.5rem", color: "var(--td-cyan)", fontSize: "0.78rem", whiteSpace: "pre-wrap" }}
        >
          {room.hint}
        </pre>
      )}
    </div>
  );
}
