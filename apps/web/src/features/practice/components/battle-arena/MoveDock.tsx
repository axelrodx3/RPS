"use client";

import type { Move } from "@/features/practice/engine/practice-engine";
import { MoveArt } from "@/features/practice/components/battle-arena/MoveArt";
import { MOVE_LIST } from "@/features/practice/moves/move-metadata";
import { usePracticeHoverSound } from "@/lib/audio/use-practice-hover-sound";
import { useAudio } from "@/providers/AudioProvider";
import styles from "../practice-game.module.css";

type MoveDockProps = {
  selectedMove: Move | null;
  locked: boolean;
  onSelect: (move: Move) => void;
};

export function MoveDock({ selectedMove, locked, onSelect }: MoveDockProps) {
  const { unlock } = useAudio();
  const playHover = usePracticeHoverSound(locked);
  const hasSelection = selectedMove !== null;

  return (
    <div className={styles.moveDock} role="group" aria-label="Choose move">
      <div className={styles.moveDockRail}>
        {MOVE_LIST.map((move) => {
          const selected = selectedMove === move.id;
          const disabled = locked;
          const dimmed = hasSelection && !selected && !locked;

          return (
            <button
              key={move.id}
              type="button"
              className={[
                styles.moveDockButton,
                selected ? styles.moveDockSelected : "",
                dimmed ? styles.moveDockDimmed : "",
                disabled ? styles.moveDockLocked : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              aria-label={`Choose ${move.label}`}
              aria-pressed={selected}
              onClick={() => onSelect(move.id)}
              onPointerEnter={playHover}
              onFocus={() => {
                if (!disabled) unlock();
              }}
            >
              <MoveArt move={move.id} variant="selection" />
              <span className={styles.moveDockLabel}>{move.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
