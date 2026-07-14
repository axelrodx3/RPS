"use client";

import { usePathname } from "next/navigation";
import { TutorialModal } from "./TutorialModal";
import { useSettings } from "@/providers/SettingsProvider";

export function TutorialGate() {
  const pathname = usePathname();
  const { settings, ready, completeTutorial } = useSettings();

  if (!ready || settings.tutorialCompleted || pathname === "/practice") {
    return null;
  }

  return (
    <TutorialModal
      open
      onClose={() => {
        completeTutorial();
      }}
    />
  );
}
