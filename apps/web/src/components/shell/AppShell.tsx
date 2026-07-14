"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RpsIcon } from "@/components/brand";
import { brand, environment } from "@/config/brand";
import { Drawer } from "@/design-system/components";
import { AudioControl } from "@/components/AudioControl";
import { AudioSettingsPanel } from "@/components/AudioSettingsPanel";
import styles from "./app-shell.module.css";

const NAV_ITEMS: { href: string; label: string; soon?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/play", label: "Play" },
  { href: "/watch", label: "Watch", soon: true },
  { href: "/leaderboards", label: "Leaderboards", soon: true },
  { href: "/history", label: "History", soon: true },
  { href: "/guide", label: "Guide" },
  { href: "/profile", label: "Profile", soon: true },
  { href: "/balance", label: "Wallet", soon: true },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${active ? styles.active : ""}`.trim()}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {item.label}
            {item.soon ? <span className={styles.soon}>Soon</span> : null}
          </Link>
        );
      })}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={styles.banner} role="status">
        <span className={styles.dot} aria-hidden="true" />
        {environment.label} · Practice available · NO REAL SOL
      </div>

      <header className={styles.header}>
        <Link href="/" className={styles.wordmark} aria-label="RPS Home">
          <RpsIcon priority />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          <NavLinks />
        </nav>

        <div className={styles.actions}>
          <AudioControl />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Navigation"
        side="right"
      >
        <nav
          id="mobile-nav"
          className={styles.mobileNav}
          aria-label="Mobile primary"
        >
          <NavLinks onNavigate={() => setMenuOpen(false)} />
          <AudioSettingsPanel layout="drawer" />
        </nav>
      </Drawer>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <span>
          {brand.name} · {brand.tagline}
        </span>
        <span>No wallet · No wagering · Local practice only</span>
      </footer>
    </div>
  );
}
