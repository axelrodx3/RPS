"use client";

import { SettingsProvider } from "./SettingsProvider";
import { ProfileProvider } from "./ProfileProvider";
import { AudioProvider } from "./AudioProvider";
import { ToastProvider } from "@/design-system/components";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ProfileProvider>
        <AudioProvider>
          <ToastProvider>{children}</ToastProvider>
        </AudioProvider>
      </ProfileProvider>
    </SettingsProvider>
  );
}
