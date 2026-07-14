import styles from "./cards-game.module.css";

export function PlayerCard({
  name,
  subtitle,
  score,
  highlight = false,
}: {
  name: string;
  subtitle?: string;
  score?: number;
  highlight?: boolean;
}) {
  return (
    <article
      className={`${styles.playerCard} ${highlight ? styles.highlight : ""}`.trim()}
    >
      <div>
        <h3>{name}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {typeof score === "number" ? (
        <strong aria-label={`${name} score`}>{score}</strong>
      ) : null}
    </article>
  );
}

export function MatchCard({
  title,
  mode,
  status,
  description,
}: {
  title: string;
  mode: string;
  status: string;
  description: string;
}) {
  return (
    <article className={styles.matchCard}>
      <div className={styles.matchMeta}>
        <span>{mode}</span>
        <span>{status}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
