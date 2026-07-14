"use client";

import { SettingsProvider } from "./SettingsProvider";
import { AudioProvider } from "./AudioProvider";
import { ToastProvider } from "@/design-system/components";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AudioProvider>
        <ToastProvider>{children}</ToastProvider>
      </AudioProvider>
    </SettingsProvider>
  );
}
