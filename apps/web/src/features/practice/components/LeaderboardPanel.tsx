"use client";

import { useId, useRef, useState } from "react";
import { MyStatsPanel } from "@/features/practice/components/MyStatsPanel";
import { usePracticeHoverSound } from "@/lib/audio/use-practice-hover-sound";
import styles from "./leaderboard-panel.module.css";

type LeaderboardPanelTab = "leaderboard" | "stats";

type LeaderboardPanelProps = {
  reducedMotion: boolean;
  defaultTab?: LeaderboardPanelTab;
  showReset?: boolean;
  variant?: "page" | "sidebar";
};

export function LeaderboardPanel({
  reducedMotion,
  defaultTab = "leaderboard",
  showReset = true,
  variant = "page",
}: LeaderboardPanelProps) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<LeaderboardPanelTab>(defaultTab);
  const [statsAnimationActive, setStatsAnimationActive] = useState(
    defaultTab === "stats",
  );
  const statsTabOpenedRef = useRef(defaultTab === "stats");
  const playHover = usePracticeHoverSound(false);

  const tabs: { id: LeaderboardPanelTab; label: string }[] = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "stats", label: "My Stats" },
  ];

  const selectTab = (tab: LeaderboardPanelTab) => {
    if (tab === "stats" && !statsTabOpenedRef.current) {
      statsTabOpenedRef.current = true;
      setStatsAnimationActive(true);
    }
    setActiveTab(tab);
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = tabs[(index + delta + tabs.length) % tabs.length];
    if (nextTab) selectTab(nextTab.id);
  };

  return (
    <section
      className={`${styles.panel} ${variant === "sidebar" ? styles.sidebar : styles.page}`.trim()}
      aria-label="Leaderboard"
      data-testid="leaderboard-panel"
    >
      <div className={styles.panelHeader}>
        <p className={styles.panelKicker}>Competitive hub</p>
        <h2 className={styles.panelTitle}>Leaderboard</h2>
      </div>

      <div
        className={styles.tabList}
        role="tablist"
        aria-label="Leaderboard sections"
      >
        {tabs.map((tab, index) => {
          const selected = activeTab === tab.id;
          const tabId = `${baseId}-tab-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              className={`${styles.tabButton} ${selected ? styles.tabButtonActive : ""}`.trim()}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onPointerEnter={playHover}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={styles.tabPanels}>
        <section
          id={`${baseId}-panel-leaderboard`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-leaderboard`}
          hidden={activeTab !== "leaderboard"}
          className={styles.tabPanel}
        >
          <div className={styles.leaderboardPlaceholder}>
            <span className={styles.placeholderBadge}>Coming soon</span>
            <h3>Wagered leaderboards</h3>
            <p>
              Finalized wager statistics will appear after real-value play is
              enabled and audited. Practice stats stay local.
            </p>
          </div>
        </section>

        <section
          id={`${baseId}-panel-stats`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-stats`}
          hidden={activeTab !== "stats"}
          className={styles.tabPanel}
        >
          <MyStatsPanel
            animate={statsAnimationActive}
            reducedMotion={reducedMotion}
            showReset={showReset}
          />
        </section>
      </div>
    </section>
  );
}
