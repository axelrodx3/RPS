import Link from "next/link";
import { Button } from "./Button";
import styles from "./states.module.css";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className={styles.state} role="status">
      <h2>{title}</h2>
      <p>{description}</p>
      {action?.href ? (
        <Link href={action.href}>
          <Button variant="secondary">{action.label}</Button>
        </Link>
      ) : action?.onClick ? (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className={`${styles.state} ${styles.error}`} role="alert">
      <h2>{title}</h2>
      <p>{description}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function ComingSoonCard({
  title,
  description,
  eyebrow = "Coming Soon",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <article className={styles.comingSoon}>
      <span className={styles.badge}>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}
