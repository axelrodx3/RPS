import Link from "next/link";
import { RpsWordmark } from "@/components/brand";
import { Button } from "@/design-system/components";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label="RPS home hero">
        <RpsWordmark variant="white" animated priority width={640} />
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
    </div>
  );
}
