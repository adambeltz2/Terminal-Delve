import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../game/store";
import { executeCode } from "../game/runner";

const LOG_COLOR: Record<string, string> = {
  system: "var(--td-amber)",
  input: "var(--td-fg)",
  stdout: "var(--td-green)",
  stderr: "var(--td-red)",
  result: "var(--td-cyan)",
};

interface Props {
  code: string;
  onChangeCode: (code: string) => void;
  disabled: boolean;
}

export function CodeConsole({ code, onChangeCode, disabled }: Props) {
  const log = useGameStore((s) => s.log);
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  async function run() {
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      await executeCode(code);
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      run();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const { selectionStart, selectionEnd, value } = target;
      const next = value.slice(0, selectionStart) + "    " + value.slice(selectionEnd);
      onChangeCode(next);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = selectionStart + 4;
      });
    }
  }

  return (
    <div className="td-panel" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div
        ref={logRef}
        className="td-scroll"
        style={{ flex: 1, minHeight: 0, padding: "0.75rem", fontSize: "0.85rem" }}
      >
        {log.map((line) => (
          <div key={line.id} style={{ color: LOG_COLOR[line.kind], whiteSpace: "pre-wrap" }}>
            {line.kind === "input" ? ">>> " : ""}
            {line.text}
          </div>
        ))}
        {log.length === 0 && (
          <div style={{ opacity: 0.5 }}>Write Python below. Ctrl/Cmd+Enter to run.</div>
        )}
      </div>
      <textarea
        className="td-input"
        style={{ borderTop: "1px solid var(--td-border)", minHeight: 140 }}
        value={code}
        onChange={(e) => onChangeCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        disabled={disabled}
        placeholder={
          disabled
            ? "loading the python runtime..."
            : "while enemy['hp'] > 0:\n    ...\n\ndoor.open()"
        }
      />
      <div style={{ display: "flex", gap: "0.5rem", padding: "0.5rem" }}>
        <button className="td-btn td-glow" onClick={run} disabled={disabled || busy}>
          {busy ? "running..." : "run (ctrl+enter)"}
        </button>
        <button
          className="td-btn"
          onClick={() => onChangeCode("")}
          disabled={disabled || busy}
        >
          clear
        </button>
      </div>
    </div>
  );
}
