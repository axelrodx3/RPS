import styles from "./scoreboard.module.css";

type ScoreboardProps = {
  playerLabel?: string;
  opponentLabel?: string;
  playerScore: number;
  opponentScore: number;
  winTarget: number;
  round: number;
};

export function Scoreboard({
  playerLabel = "You",
  opponentLabel = "CPU",
  playerScore,
  opponentScore,
  winTarget,
  round,
}: ScoreboardProps) {
  return (
    <section className={styles.root} aria-label="Match scoreboard">
      <div className={styles.round}>
        <span className={styles.kicker}>Round</span>
        <strong>{round}</strong>
      </div>
      <div className={styles.scores}>
        <div className={styles.side}>
          <span>{playerLabel}</span>
          <strong aria-label={`${playerLabel} score`}>{playerScore}</strong>
          <small>First to {winTarget}</small>
        </div>
        <div className={styles.divider} aria-hidden="true">
          :
        </div>
        <div className={styles.side}>
          <span>{opponentLabel}</span>
          <strong aria-label={`${opponentLabel} score`}>{opponentScore}</strong>
          <small>First to {winTarget}</small>
        </div>
      </div>
    </section>
  );
}
