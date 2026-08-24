import { useGameStore } from "../game/store";

export function StatusBar() {
  const player = useGameStore((s) => s.player);
  const depth = useGameStore((s) => s.depth);
  const room = useGameStore((s) => s.currentRoom);

  const hpPct = Math.max(0, Math.min(100, (player.hp / player.max_hp) * 100));

  return (
    <div
      className="td-panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "0.6rem 1rem",
        fontSize: "0.8rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 160 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{player.name}</span>
          <span>
            {player.hp}/{player.max_hp} hp
          </span>
        </div>
        <div className="td-hp-bar">
          <div className="td-hp-bar-fill" style={{ width: `${hpPct}%` }} />
        </div>
      </div>
      <span>depth: {depth}</span>
      <span>gold: {player.gold}</span>
      <span>
        equipped: {player.equipped?.name ?? "fists"}
        {player.equipped?.modifier ? ` (+${player.equipped.value} ${player.equipped.modifier})` : ""}
      </span>
      <span>base_attack: {player.base_attack}</span>
      {room && (
        <span style={{ marginLeft: "auto", color: "var(--td-amber)" }}>
          room: {room.type}
          {room.resolved ? " — cleared" : ""}
        </span>
      )}
    </div>
  );
}
