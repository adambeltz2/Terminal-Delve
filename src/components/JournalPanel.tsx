import { useState } from "react";
import { useGameStore } from "../game/store";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  onClose: () => void;
  onLoadScript: (code: string) => void;
  currentCode: string;
}

export function JournalPanel({ onClose, onLoadScript, currentCode }: Props) {
  const journal = useGameStore((s) => s.journal);
  const scripts = useGameStore((s) => s.scripts);
  const upsertJournalEntry = useGameStore((s) => s.upsertJournalEntry);
  const deleteJournalEntry = useGameStore((s) => s.deleteJournalEntry);
  const saveScript = useGameStore((s) => s.saveScript);
  const deleteScript = useGameStore((s) => s.deleteScript);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scriptName, setScriptName] = useState("");

  function edit(id: string | null) {
    if (id) {
      const entry = journal.find((e) => e.id === id);
      if (!entry) return;
      setEditingId(id);
      setTitle(entry.title);
      setBody(entry.body);
    } else {
      setEditingId(null);
      setTitle("");
      setBody("");
    }
  }

  function save() {
    if (!title.trim()) return;
    upsertJournalEntry(editingId, title.trim(), body);
    edit(null);
  }

  function exportAll() {
    const text = journal
      .map((e) => `# ${e.title}\n\n${e.body}\n`)
      .join("\n---\n\n");
    downloadText("scribes-journal.md", text || "# Scribe's Journal\n\n(empty)");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        className="td-panel td-scroll"
        style={{ width: "min(900px, 100%)", maxHeight: "90vh", overflow: "auto", padding: "1.5rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="td-glow" style={{ color: "var(--td-green)", margin: 0 }}>
            Scribe&apos;s Journal
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="td-btn" onClick={exportAll}>
              export .md
            </button>
            <button className="td-btn" onClick={onClose}>
              close
            </button>
          </div>
        </div>
        <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
          Notes and scripts here survive death. Save mechanics you&apos;ve learned, or reusable
          code you want at the start of your next run.
        </p>

        <section style={{ marginTop: "1rem" }}>
          <h3 style={{ color: "var(--td-amber)" }}>Notes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {journal.map((e) => (
              <div key={e.id} className="td-panel" style={{ padding: "0.5rem 0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{e.title}</strong>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="td-btn" style={{ padding: "0.1rem 0.5rem" }} onClick={() => edit(e.id)}>
                      edit
                    </button>
                    <button
                      className="td-btn td-btn-amber"
                      style={{ padding: "0.1rem 0.5rem" }}
                      onClick={() => deleteJournalEntry(e.id)}
                    >
                      delete
                    </button>
                  </div>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>{e.body}</pre>
              </div>
            ))}
            {journal.length === 0 && <div style={{ opacity: 0.5, fontSize: "0.85rem" }}>No entries yet.</div>}
          </div>

          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <input
              className="td-input"
              placeholder="entry title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="td-input"
              placeholder="markdown notes..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: 100 }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="td-btn" onClick={save}>
                {editingId ? "update entry" : "add entry"}
              </button>
              {editingId && (
                <button className="td-btn" onClick={() => edit(null)}>
                  cancel
                </button>
              )}
            </div>
          </div>
        </section>

        <section style={{ marginTop: "1.5rem" }}>
          <h3 style={{ color: "var(--td-amber)" }}>Saved Scripts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {scripts.map((s) => (
              <div
                key={s.id}
                className="td-panel"
                style={{ padding: "0.5rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>{s.name}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="td-btn" style={{ padding: "0.1rem 0.5rem" }} onClick={() => onLoadScript(s.code)}>
                    load into console
                  </button>
                  <button
                    className="td-btn td-btn-amber"
                    style={{ padding: "0.1rem 0.5rem" }}
                    onClick={() => deleteScript(s.id)}
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
            {scripts.length === 0 && <div style={{ opacity: 0.5, fontSize: "0.85rem" }}>No saved scripts yet.</div>}
          </div>
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <input
              className="td-input"
              placeholder="name this script to save current console code"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
            />
            <button
              className="td-btn"
              disabled={!scriptName.trim() || !currentCode.trim()}
              onClick={() => {
                saveScript(scriptName.trim(), currentCode);
                setScriptName("");
              }}
            >
              save current code
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
