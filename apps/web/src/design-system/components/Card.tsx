import styles from "./card.module.css";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: "sm" | "md" | "lg";
};

export function Card({
  children,
  className = "",
  interactive = false,
  padding = "md",
}: CardProps) {
  return (
    <article
      className={[
        styles.card,
        styles[padding],
        interactive ? styles.interactive : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </article>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={`${styles.header} ${className}`.trim()}>
      {children}
    </header>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${styles.body} ${className}`.trim()}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <footer className={`${styles.footer} ${className}`.trim()}>
      {children}
    </footer>
  );
}
