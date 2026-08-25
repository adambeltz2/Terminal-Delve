import { useGameStore } from "../game/store";

export function StartScreen() {
  const startRun = useGameStore((s) => s.startRun);
  const startTutorial = useGameStore((s) => s.startTutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);
  const deathCount = useGameStore((s) => s.deathCount);
  const tutorialDone = useGameStore((s) => s.tutorialDone);
  const journalCount = useGameStore((s) => s.journal.length);
  const scriptCount = useGameStore((s) => s.scripts.length);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <pre className="td-ascii td-glow" style={{ fontSize: "1rem" }}>
        {[
          "############################################",
          "#                                            #",
          "#          T E R M I N A L   D E L V E       #",
          "#                                            #",
          "#              >>> door.open()               #",
          "#                                            #",
          "############################################",
        ].join("\n")}
      </pre>
      <p style={{ maxWidth: 560, color: "var(--td-fg)", opacity: 0.85 }}>
        A roguelike dungeon crawler you play by writing Python. Every room is
        a puzzle solved with real code, run instantly in your browser.
        Permadeath resets your character — your Scribe&apos;s Journal and
        saved scripts survive.
      </p>

      {tutorialDone ? (
        <>
          <button className="td-btn td-glow" style={{ fontSize: "1.1rem" }} onClick={startRun}>
            {deathCount > 0 ? "Descend Again" : "Begin the Delve"}
          </button>
          <button
            className="td-btn"
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}
            onClick={startTutorial}
          >
            replay python tutorial
          </button>
        </>
      ) : (
        <>
          <button className="td-btn td-glow" style={{ fontSize: "1.1rem" }} onClick={startTutorial}>
            Start Python Tutorial
          </button>
          <button
            className="td-btn"
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}
            onClick={skipTutorial}
          >
            skip — I already know Python
          </button>
        </>
      )}

      <div style={{ display: "flex", gap: "2rem", fontSize: "0.8rem", opacity: 0.7 }}>
        <span>deaths: {deathCount}</span>
        <span>journal entries: {journalCount}</span>
        <span>saved scripts: {scriptCount}</span>
      </div>
    </div>
  );
}
