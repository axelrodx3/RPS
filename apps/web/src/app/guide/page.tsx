import { Card, Tabs } from "@/design-system/components";
import styles from "./guide.module.css";

const FAQ = [
  {
    q: "Is Practice real wagering?",
    a: "No. Practice is local-only, uses a fair random CPU, and never touches wallets, balances, or on-chain state.",
  },
  {
    q: "When can I play with SOL?",
    a: "After the program, audits, and selective non-reveal gates from Prompt 1 are satisfied. Until then Play With SOL stays disabled.",
  },
  {
    q: "How do rounds work?",
    a: "Best of three in practice: first to two non-tied round wins. Ties replay without changing the score.",
  },
  {
    q: "What happens on timeout?",
    a: "If the 20-second timer expires, a random Rock, Paper, or Scissors move is chosen automatically.",
  },
] as const;

export default function GuidePage() {
  return (
    <div className={styles.page}>
      <header>
        <p className={styles.kicker}>Game Guide</p>
        <h1>Rules, safety, and how to play</h1>
        <p>
          This guide reflects Prompt 1 architecture. Wagered modes reuse the
          same scoring logic with on-chain commit-reveal when enabled.
        </p>
      </header>

      <div className={styles.grid}>
        <Card padding="lg">
          <h2>Practice mode</h2>
          <ul>
            <li>Local CPU opponent with equal random probability.</li>
            <li>20-second move timer with automatic random fallback.</li>
            <li>Reveal animation, round history, rematch, and local stats.</li>
          </ul>
        </Card>
        <Card padding="lg">
          <h2>Future wagered 1v1</h2>
          <ul>
            <li>Private moves via canonical commit-reveal encoding.</li>
            <li>Atomic funding locks every wager together or none.</li>
            <li>Program-authoritative balances and settlement.</li>
          </ul>
        </Card>
      </div>

      <Tabs
        defaultId="faq"
        items={[
          {
            id: "faq",
            label: "FAQ",
            content: (
              <dl className={styles.faq}>
                {FAQ.map((item) => (
                  <div key={item.q}>
                    <dt>{item.q}</dt>
                    <dd>{item.a}</dd>
                  </div>
                ))}
              </dl>
            ),
          },
          {
            id: "modes",
            label: "Modes",
            content: (
              <ul>
                <li>1v1 — first to two non-tied rounds.</li>
                <li>2v2 — fixed teams with paired round scoring.</li>
                <li>1v1v1v1 — four players, two lives, last survivor wins.</li>
              </ul>
            ),
          },
        ]}
      />
    </div>
  );
}
