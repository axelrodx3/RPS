import styles from "./tooltip.module.css";

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  return (
    <span className={styles.root}>
      {children}
      <span className={styles.tip} role="tooltip">
        {content}
      </span>
    </span>
  );
}

export function Popover({
  title,
  children,
  triggerLabel,
}: {
  title: string;
  children: React.ReactNode;
  triggerLabel: string;
}) {
  return (
    <details className={styles.popover}>
      <summary aria-label={triggerLabel}>{triggerLabel}</summary>
      <div className={styles.popoverPanel}>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </details>
  );
}
