/** @vitest-environment happy-dom */

import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AppShell } from "@/components/shell/AppShell";
import { AudioControl } from "@/components/AudioControl";
import { renderWithProviders } from "@/test/render";

function mockMatchMedia(mobile: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: mobile && query.includes("max-width: 880px"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("AudioControl", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("toggles master mute from the desktop panel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AudioControl />);

    await user.click(
      screen.getAllByRole("button", { name: /master audio/i })[0]!,
    );

    const muteSwitch = screen.getByRole("switch", { name: "Master mute" });
    expect(muteSwitch).not.toBeChecked();

    await user.click(muteSwitch);
    expect(muteSwitch).toBeChecked();
  });

  it("changes master and sound effects volume", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AudioControl />);

    await user.click(
      screen.getAllByRole("button", { name: /master audio/i })[0]!,
    );

    expect(
      screen.getByRole("slider", { name: /Master volume/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /Sound effects volume/i }),
    ).toBeInTheDocument();
  });
});

describe("Mobile header controls", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps menu and volume controls in separate clickable regions", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AppShell>
        <div>Page</div>
      </AppShell>,
    );

    const menu = screen.getAllByRole("button", { name: "Menu" })[0]!;
    const volume = screen.getAllByRole("button", { name: /master audio/i })[0]!;

    const menuBox = menu.getBoundingClientRect();
    const volumeBox = volume.getBoundingClientRect();
    const separated =
      menuBox.right <= volumeBox.left || volumeBox.right <= menuBox.left;
    expect(separated).toBe(true);

    const initialLabel = volume.getAttribute("aria-label");
    await user.click(volume);
    expect(volume.getAttribute("aria-label")).not.toBe(initialLabel);
  });

  it("opens the mobile drawer audio settings without overlapping the menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AppShell>
        <div>Page</div>
      </AppShell>,
    );

    await user.click(screen.getAllByRole("button", { name: "Menu" })[0]!);
    expect(screen.getByLabelText("Audio settings")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /Master volume/i }),
    ).toBeInTheDocument();
  });
});
