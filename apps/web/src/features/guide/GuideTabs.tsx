"use client";

import { Tabs } from "@/design-system/components/Tabs";
import styles from "@/app/guide/guide.module.css";

const FAQ = [
  {
    q: "Is Practice real wagering?",
    a: "No. Practice is local only, uses a fair random CPU, and never touches wallets, balances, or on chain state.",
  },
  {
    q: "When can I play with SOL?",
    a: "After the program, audits, and selective non reveal gates from Prompt 1 are satisfied. Until then Play With SOL stays disabled.",
  },
  {
    q: "How do rounds work?",
    a: "Best of three in practice: first to two non tied round wins. Ties replay without changing the score.",
  },
  {
    q: "What happens on timeout?",
    a: "If the 20 second timer expires, a random Rock, Paper, or Scissors move is chosen automatically.",
  },
] as const;

export function GuideTabs() {
  return (
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
              <li>1v1 — first to two non tied rounds.</li>
              <li>2v2 — fixed teams with paired round scoring.</li>
              <li>1v1v1v1 — four players, two lives, last survivor wins.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
