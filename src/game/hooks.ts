import { useEffect, useState } from "react";
import { initRunner } from "./runner";

type BootStatus = "idle" | "loading" | "ready" | "error";

export function usePyodideBoot(active: boolean) {
  const [status, setStatus] = useState<BootStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setStatus("loading");
    setError(null);
    initRunner()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  return { status, error };
}
