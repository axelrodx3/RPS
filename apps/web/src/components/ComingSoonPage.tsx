import { ComingSoonCard } from "@/design-system/components";
import styles from "./coming-soon-page.module.css";

export function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className={styles.page}>
      <ComingSoonCard title={title} description={description} />
    </section>
  );
}
