import { useState } from "react";
import { useGameStore } from "../game/store";
import { usePyodideBoot } from "../game/hooks";
import { StatusBar } from "./StatusBar";
import { RoomView } from "./RoomView";
import { HintPanel } from "./HintPanel";
import { InventoryPanel } from "./InventoryPanel";
import { CodeConsole } from "./CodeConsole";
import { JournalPanel } from "./JournalPanel";

export function GameScreen() {
  const { status, error } = usePyodideBoot(true);
  const [code, setCode] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const player = useGameStore((s) => s.player);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <StatusBar />
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          padding: "0.75rem",
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ flex: "1 1 40%", display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 0 }}>
          <RoomView />
          <HintPanel />
          <InventoryPanel />
          <button className="td-btn" onClick={() => setJournalOpen(true)}>
            open scribe&apos;s journal
          </button>
          {status === "loading" && <div style={{ opacity: 0.6 }}>booting python runtime...</div>}
          {status === "error" && (
            <div style={{ color: "var(--td-red)" }}>failed to load python runtime: {error}</div>
          )}
        </div>
        <div style={{ flex: "1 1 60%", display: "flex", minHeight: 0 }}>
          <CodeConsole code={code} onChangeCode={setCode} disabled={status !== "ready" || player.hp <= 0} />
        </div>
      </div>
      {journalOpen && (
        <JournalPanel currentCode={code} onLoadScript={setCode} onClose={() => setJournalOpen(false)} />
      )}
    </div>
  );
}
