import Link from "next/link";
import { Button, Card, ComingSoonCard } from "@/design-system/components";
import styles from "./play.module.css";

export default function PlayPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Play</p>
        <h1>Choose how you want to compete</h1>
        <p>
          Practice is live now. Wagered Solana play, lobbies, and matchmaking
          arrive in later phases with explicit safety gates.
        </p>
      </header>

      <div className={styles.grid}>
        <Card padding="lg" interactive className={styles.practiceCard}>
          <span className={styles.badge}>Available</span>
          <h2>Practice</h2>
          <p>
            Unlimited local CPU matches. Best of three, 20-second timer, full
            reveal flow, and local statistics only.
          </p>
          <Link href="/practice">
            <Button size="lg">Start Practice</Button>
          </Link>
        </Card>

        <ComingSoonCard
          title="Play with SOL"
          description="Wallet-backed wagering, atomic funding, and on-chain settlement remain disabled until Prompt 1 gates pass."
        />
      </div>
    </div>
  );
}
