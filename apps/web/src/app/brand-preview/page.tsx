import Image from "next/image";
import { RpsIcon, RpsWordmark } from "@/components/brand";
import { brand } from "@/config/brand";
import styles from "./brand-preview.module.css";

export const metadata = {
  title: "Brand Preview",
  robots: { index: false, follow: false },
};

const ICON_SIZES = [16, 32, 48, 180] as const;

export default function BrandPreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.badge}>Internal branding preview</p>
        <h1>RPS brand asset review</h1>
        <p>
          Temporary route for inspecting approved branding assets inside the
          live design system. Not linked in public navigation.
        </p>
      </header>

      <section className={styles.panel} aria-labelledby="white-wordmark-title">
        <h2 id="white-wordmark-title">White wordmark on black</h2>
        <div className={styles.darkSurface}>
          <RpsWordmark variant="white" width={640} />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="lime-wordmark-title">
        <h2 id="lime-wordmark-title">Lime wordmark on black</h2>
        <div className={styles.darkSurface}>
          <RpsWordmark variant="lime" width={640} />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="icon-sizes-title">
        <h2 id="icon-sizes-title">R icon sizes</h2>
        <div className={styles.iconGrid}>
          {ICON_SIZES.map((size) => (
            <figure key={size} className={styles.iconSample}>
              <Image
                src={`/brand/rps-icon-${size}.png`}
                alt={`RPS icon at ${size} pixels wide`}
                width={size}
                height={Math.round(size * 0.66)}
              />
              <figcaption>{size}px</figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.headerPreview}>
          <p className={styles.label}>Header size</p>
          <RpsIcon size={34} />
        </div>
        <div className={styles.heroPreview}>
          <p className={styles.label}>Large hero size</p>
          <RpsWordmark variant="white" width={960} />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="contrast-title">
        <h2 id="contrast-title">Light background contrast</h2>
        <p className={styles.note}>
          White wordmark is intended for dark surfaces. Lime wordmark shown here
          for light background comparison.
        </p>
        <div className={styles.lightSurface}>
          <RpsWordmark variant="lime" width={480} />
        </div>
      </section>

      <section className={styles.meta} aria-label="Asset paths">
        <h2>Centralized asset paths</h2>
        <ul>
          <li>White wordmark: {brand.assets.wordmarkWhite}</li>
          <li>Lime wordmark: {brand.assets.wordmarkLime}</li>
          <li>R icon: {brand.assets.icon}</li>
          <li>Favicon: {brand.assets.icon32}</li>
        </ul>
      </section>
    </div>
  );
}
