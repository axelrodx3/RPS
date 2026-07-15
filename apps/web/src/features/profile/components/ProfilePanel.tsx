"use client";

import { useId, useRef, useState } from "react";
import { usePracticeHoverSound } from "@/lib/audio/use-practice-hover-sound";
import { ProfileOverviewTab } from "@/features/profile/components/ProfileOverviewTab";
import { ProfileProgressTab } from "@/features/profile/components/ProfileProgressTab";
import { ProfileStatsTab } from "@/features/profile/components/ProfileStatsTab";
import { ProfileUnlocksTab } from "@/features/profile/components/ProfileUnlocksTab";
import styles from "../profile-panel.module.css";

type ProfilePanelTab = "overview" | "unlocks" | "progress" | "stats";

type ProfilePanelProps = {
  reducedMotion: boolean;
  defaultTab?: ProfilePanelTab;
};

export function ProfilePanel({
  reducedMotion,
  defaultTab = "overview",
}: ProfilePanelProps) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<ProfilePanelTab>(defaultTab);
  const [statsAnimationActive, setStatsAnimationActive] = useState(
    defaultTab === "stats",
  );
  const statsTabOpenedRef = useRef(defaultTab === "stats");
  const playHover = usePracticeHoverSound(false);

  const tabs: { id: ProfilePanelTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "unlocks", label: "Unlocks" },
    { id: "progress", label: "Progress" },
    { id: "stats", label: "Stats" },
  ];

  const selectTab = (tab: ProfilePanelTab) => {
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
      className={styles.panel}
      aria-labelledby={`${baseId}-page-title`}
      data-testid="profile-panel"
    >
      <h1 id={`${baseId}-page-title`} className={styles.pageTitle}>
        PROFILE
      </h1>

      <div
        className={styles.tabList}
        role="tablist"
        aria-label="Profile sections"
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
          id={`${baseId}-panel-overview`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-overview`}
          hidden={activeTab !== "overview"}
        >
          <ProfileOverviewTab />
        </section>

        <section
          id={`${baseId}-panel-unlocks`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-unlocks`}
          hidden={activeTab !== "unlocks"}
        >
          <ProfileUnlocksTab />
        </section>

        <section
          id={`${baseId}-panel-progress`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-progress`}
          hidden={activeTab !== "progress"}
        >
          <ProfileProgressTab />
        </section>

        <section
          id={`${baseId}-panel-stats`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-stats`}
          hidden={activeTab !== "stats"}
        >
          <ProfileStatsTab
            animate={statsAnimationActive}
            reducedMotion={reducedMotion}
          />
        </section>
      </div>
    </section>
  );
}
