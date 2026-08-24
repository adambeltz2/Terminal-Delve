import { useGameStore } from "../game/store";

export function DeathScreen() {
  const depth = useGameStore((s) => s.depth);
  const deathCount = useGameStore((s) => s.deathCount);
  const restartAfterDeath = useGameStore((s) => s.restartAfterDeath);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <pre className="td-ascii" style={{ color: "var(--td-red)", fontSize: "1rem" }}>
        {["############################", "#       Y O U   D I E D     #", "############################"].join("\n")}
      </pre>
      <p style={{ opacity: 0.85 }}>
        You fell at depth {depth}. Death #{deathCount}.
      </p>
      <p style={{ opacity: 0.6, maxWidth: 480, fontSize: "0.85rem" }}>
        Your character and gear are gone — but your Scribe&apos;s Journal and saved
        scripts made it out. Bring them into the next run.
      </p>
      <button className="td-btn td-glow" style={{ fontSize: "1.1rem" }} onClick={restartAfterDeath}>
        descend again
      </button>
    </div>
  );
}
