import { useEffect, useState } from "react";
import { useGameStore } from "../game/store";
import { usePyodideBoot } from "../game/hooks";
import { TUTORIAL_STEPS } from "../game/tutorial";
import { CodeConsole } from "./CodeConsole";

export function TutorialScreen() {
  const { status, error } = usePyodideBoot(true);
  const [code, setCode] = useState("");
  const currentRoom = useGameStore((s) => s.currentRoom);
  const tutorialIndex = useGameStore((s) => s.tutorialIndex);
  const skipTutorial = useGameStore((s) => s.skipTutorial);

  useEffect(() => {
    if (currentRoom?.starterCode !== undefined) setCode(currentRoom.starterCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom?.id]);

  if (!currentRoom) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div
        className="td-panel"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 1rem",
          fontSize: "0.8rem",
        }}
      >
        <span style={{ opacity: 0.7 }}>
          python tutorial — lesson {tutorialIndex + 1} of {TUTORIAL_STEPS.length}
        </span>
        <button
          className="td-btn"
          style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}
          onClick={skipTutorial}
        >
          skip to the delve
        </button>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", padding: "0.75rem", flex: 1, minHeight: 0 }}>
        <div
          className="td-panel td-scroll"
          style={{ flex: "1 1 40%", padding: "1rem", overflowY: "auto" }}
        >
          <pre className="td-ascii">{currentRoom.ascii}</pre>
          <h2 className="td-glow" style={{ margin: "0.25rem 0", color: "var(--td-green)" }}>
            {currentRoom.title}
          </h2>
          <p style={{ whiteSpace: "pre-wrap", color: "var(--td-fg)" }}>{currentRoom.flavor}</p>
          {status === "loading" && <div style={{ opacity: 0.6 }}>booting python runtime...</div>}
          {status === "error" && (
            <div style={{ color: "var(--td-red)" }}>failed to load python runtime: {error}</div>
          )}
        </div>
        <div style={{ flex: "1 1 60%", display: "flex", minHeight: 0 }}>
          <CodeConsole code={code} onChangeCode={setCode} disabled={status !== "ready"} />
        </div>
      </div>
    </div>
  );
}
