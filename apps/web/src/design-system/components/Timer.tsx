import styles from "./timer.module.css";

type TimerProps = {
  seconds: number;
  totalSeconds: number;
  label?: string;
  warningAt?: number;
  criticalAt?: number;
};

export function Timer({
  seconds,
  totalSeconds,
  label = "Time remaining",
  warningAt = 5,
  criticalAt = 3,
}: TimerProps) {
  const progress = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
  const tone =
    seconds <= criticalAt
      ? styles.critical
      : seconds <= warningAt
        ? styles.warning
        : "";

  return (
    <div className={styles.root} role="timer" aria-label={label}>
      <div className={styles.meta}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.value} ${tone}`.trim()} aria-live="polite">
          {seconds}s
        </span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <div
          className={`${styles.fill} ${tone}`.trim()}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
