import { useState } from "react";
import { useGameStore } from "../game/store";
import type { Item } from "../game/types";

function itemSummary(item: Item): string {
  const bits: string[] = [];
  if (item.base_damage != null) bits.push(`base_damage ${item.base_damage}`);
  if (item.value != null && item.modifier) bits.push(`+${item.value} ${item.modifier}`);
  if (Array.isArray(item.applied_runes) && item.applied_runes.length > 0) {
    bits.push(`runes: ${(item.applied_runes as Item[]).map((r) => r.modifier).join(", ")}`);
  }
  return bits.join(", ");
}

export function InventoryPanel() {
  const equipped = useGameStore((s) => s.player.equipped);
  const inventory = useGameStore((s) => s.player.inventory);
  const [open, setOpen] = useState(false);

  return (
    <div className="td-panel" style={{ padding: "0.75rem 1rem" }}>
      <button
        className="td-btn"
        style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "hide gear" : `gear (${inventory.length} carried)`}
      </button>
      {open && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          <div style={{ color: "var(--td-green)" }}>
            equipped: {equipped?.name ?? "fists"}
            {equipped ? ` — ${itemSummary(equipped)}` : ""}
          </div>
          {inventory.length === 0 ? (
            <div style={{ opacity: 0.5, marginTop: "0.35rem" }}>
              inventory is empty — forged loot lands here, not on your weapon.
            </div>
          ) : (
            <div style={{ marginTop: "0.35rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {inventory.map((item, i) => (
                <div key={`${item.name}-${i}`} style={{ opacity: 0.85 }}>
                  inventory[{i}]: {item.name} — {itemSummary(item)}
                </div>
              ))}
              <div style={{ opacity: 0.5, marginTop: "0.25rem" }}>
                equip(inventory[i]) to wield one.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
