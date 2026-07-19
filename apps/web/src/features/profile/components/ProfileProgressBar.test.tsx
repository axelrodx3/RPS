/** @vitest-environment happy-dom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfileProgressBar } from "@/features/profile/components/ProfileProgressBar";
import { PROFILE_PROGRESS_ASSETS_EXPORTED } from "@/features/profile/profile-progress-assets";

describe("ProfileProgressBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses css fallback when exported assets are unavailable", () => {
    expect(PROFILE_PROGRESS_ASSETS_EXPORTED).toBe(false);
    render(
      <ProfileProgressBar value={420} max={600} label="Level 3 progress" />,
    );
    const bar = screen.getByRole("progressbar", { name: "Level 3 progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "420");
    expect(bar).toHaveAttribute("aria-valuemax", "600");
    expect(bar).toHaveAttribute("data-exported", "false");
  });

  it("supports reduced motion styling", () => {
    render(
      <ProfileProgressBar
        value={50}
        max={100}
        label="Progress"
        reducedMotion
      />,
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
