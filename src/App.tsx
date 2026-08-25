import { useGameStore } from "./game/store";
import { StartScreen } from "./components/StartScreen";
import { TutorialScreen } from "./components/TutorialScreen";
import { GameScreen } from "./components/GameScreen";
import { DeathScreen } from "./components/DeathScreen";

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="td-crt">
      {phase === "title" && <StartScreen />}
      {phase === "tutorial" && <TutorialScreen />}
      {phase === "running" && <GameScreen />}
      {phase === "dead" && <DeathScreen />}
    </div>
  );
}
