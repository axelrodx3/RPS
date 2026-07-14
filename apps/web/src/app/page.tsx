import Link from "next/link";
import { brand } from "@/config/brand";
import { Button, Card, MatchCard } from "@/design-system/components";
import styles from "./home.module.css";

const MODES = [
  {
    mode: "1v1",
    title: "Head to head",
    description: "First to two non tied rounds.",
    status: "Practice available",
  },
  {
    mode: "2v2",
    title: "Fixed teams",
    description: "Paired round scoring with synchronized private moves.",
    status: "Planned",
  },
  {
    mode: "1v1v1v1",
    title: "Four-player elimination",
    description: "Two lives each. Last player standing wins the pot.",
    status: "Planned",
  },
] as const;

const SUMMARIES = [
  {
    title: "Safety",
    copy: "Real SOL, deposits, withdrawals, and wagering remain disabled. Practice is local only and never touches balances.",
  },
  {
    title: "Fairness",
    copy: "Commit reveal, atomic funding, and scoped sessions are documented in Prompt 1. Production gates still block wagered play.",
  },
  {
    title: "Architecture",
    copy: "Program authoritative balances, projection only backend indexing, and versioned game modules guide every future phase.",
  },
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Competitive Rock Paper Scissors</p>
        <h1>
          Rock. Paper. Scissors.
          <span>Built for verifiable competition.</span>
        </h1>
        <p className={styles.lead}>{brand.tagline}</p>
        <div className={styles.heroActions}>
          <Link href="/practice">
            <Button size="lg">Practice</Button>
          </Link>
          <Button size="lg" variant="secondary" disabled>
            Play with SOL · Coming Soon
          </Button>
          <Button size="lg" variant="ghost" disabled>
            Watch Live · Coming Soon
          </Button>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="modes-title">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Game modes</p>
          <h2 id="modes-title">Three formats. One platform.</h2>
        </div>
        <div className={styles.modeGrid}>
          {MODES.map((mode) => (
            <MatchCard
              key={mode.mode}
              title={mode.title}
              mode={mode.mode}
              status={mode.status}
              description={mode.description}
            />
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="summaries-title">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>Trust by design</p>
          <h2 id="summaries-title">Safety, fairness, and architecture</h2>
        </div>
        <div className={styles.summaryGrid}>
          {SUMMARIES.map((item) => (
            <Card key={item.title} interactive padding="lg">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
