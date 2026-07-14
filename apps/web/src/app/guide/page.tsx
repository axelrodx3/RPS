import { Card } from "@/design-system/components";
import { RpsWordmark } from "@/components/brand";
import { GuideTabs } from "@/features/guide/GuideTabs";
import styles from "./guide.module.css";

export default function GuidePage() {
  return (
    <div className={styles.page}>
      <header>
        <p className={styles.kicker}>Game Guide</p>
        <h1>Rules, safety, and how to play</h1>
      </header>

      <div className={styles.brandHero} aria-label="RPS">
        <RpsWordmark variant="lime" width={420} />
      </div>

      <div className={styles.grid}>
        <Card padding="lg">
          <h2>Practice mode</h2>
          <ul>
            <li>Local CPU opponent with equal random probability.</li>
            <li>20 second move timer with automatic random fallback.</li>
            <li>Reveal animation, round history, rematch, and local stats.</li>
          </ul>
        </Card>
        <Card padding="lg">
          <h2>Future wagered 1v1</h2>
          <ul>
            <li>Private moves via canonical commit reveal encoding.</li>
            <li>Atomic funding locks every wager together or none.</li>
            <li>Program authoritative balances and settlement.</li>
          </ul>
        </Card>
      </div>

      <GuideTabs />
    </div>
  );
}
