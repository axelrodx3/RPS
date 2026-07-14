"use client";

import { useId, useState } from "react";
import styles from "./tabs.module.css";

type TabItem = { id: string; label: string; content: React.ReactNode };

export function Tabs({
  items,
  defaultId,
}: {
  items: TabItem[];
  defaultId?: string;
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultId ?? items[0]?.id ?? "");

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + delta + items.length) % items.length;
    const nextId = items[nextIndex]?.id;
    if (nextId) {
      setActiveId(nextId);
      document.getElementById(`${baseId}-tab-${nextId}`)?.focus();
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.list} role="tablist" aria-label="Sections">
        {items.map((item, index) => {
          const selected = item.id === activeId;
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;
          return (
            <button
              key={item.id}
              id={tabId}
              type="button"
              role="tab"
              className={selected ? styles.active : ""}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const selected = item.id === activeId;
        const tabId = `${baseId}-tab-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;
        return (
          <section
            key={item.id}
            id={panelId}
            className={styles.panel}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!selected}
          >
            {selected ? item.content : null}
          </section>
        );
      })}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? styles.segmentActive : ""}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
